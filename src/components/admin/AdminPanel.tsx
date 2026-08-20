import { useCallback, useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Plus, RefreshCw, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  adminDeleteCreation,
  adminDeleteCustomer,
  adminOverview,
  adminUpdateCustomer,
  adminUpsertCreation,
} from "@/lib/admin.functions";

type Customer = {
  id: string;
  name: string;
  phone: string;
  note: string | null;
  is_blocked: boolean;
  created_at: string;
};

type Creation = {
  id: string;
  name: string;
  creator: string;
  taste: string;
  rating: number;
  votes: number;
  is_hidden: boolean;
  is_featured: boolean;
  created_at: string;
};

const emptyDraft = {
  name: "",
  creator: "",
  taste: "",
  rating: 0,
  votes: 0,
  is_hidden: false,
  is_featured: false,
};

export function AdminPanel() {
  const overview = useServerFn(adminOverview);
  const updateCustomer = useServerFn(adminUpdateCustomer);
  const deleteCustomer = useServerFn(adminDeleteCustomer);
  const upsertCreation = useServerFn(adminUpsertCreation);
  const deleteCreation = useServerFn(adminDeleteCreation);

  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [creations, setCreations] = useState<Creation[]>([]);
  const [draft, setDraft] = useState({ ...emptyDraft });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await overview({});
      setCustomers(data.customers as Customer[]);
      setCreations(data.creations as Creation[]);
    } catch {
      toast.error("Gagal memuat data.");
    } finally {
      setLoading(false);
    }
  }, [overview]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <Tabs defaultValue="creations" className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <TabsList>
          <TabsTrigger value="creations">Kreasi ({creations.length})</TabsTrigger>
          <TabsTrigger value="customers">Pelanggan ({customers.length})</TabsTrigger>
        </TabsList>
        <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
          {loading ? (
            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-1.5 h-4 w-4" />
          )}
          Muat ulang
        </Button>
      </div>

      <TabsContent value="creations" className="mt-6 space-y-6">
        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-display text-xl tracking-tight">Tambah kreasi</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Input
              placeholder="Nama kreasi"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            />
            <Input
              placeholder="Peracik"
              value={draft.creator}
              onChange={(e) => setDraft({ ...draft, creator: e.target.value })}
            />
            <Input
              placeholder="Catatan rasa"
              value={draft.taste}
              onChange={(e) => setDraft({ ...draft, taste: e.target.value })}
            />
            <Input
              type="number"
              step="0.1"
              min={0}
              max={5}
              placeholder="Rating 0-5"
              value={draft.rating}
              onChange={(e) => setDraft({ ...draft, rating: Number(e.target.value) })}
            />
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-6">
            <label className="flex items-center gap-2 text-sm">
              <Switch
                checked={draft.is_featured}
                onCheckedChange={(v) => setDraft({ ...draft, is_featured: v })}
              />
              Disorot
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Switch
                checked={draft.is_hidden}
                onCheckedChange={(v) => setDraft({ ...draft, is_hidden: v })}
              />
              Disembunyikan
            </label>
            <Button
              size="sm"
              onClick={async () => {
                if (!draft.name.trim() || !draft.creator.trim()) {
                  toast.error("Nama kreasi dan peracik wajib diisi.");
                  return;
                }
                const res = await upsertCreation({ data: draft });
                if (!res.ok) return void toast.error("Gagal menyimpan kreasi.");
                toast.success("Kreasi ditambahkan.");
                setDraft({ ...emptyDraft });
                await load();
              }}
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Tambah
            </Button>
          </div>
        </section>

        <div className="overflow-x-auto rounded-2xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Peracik</TableHead>
                <TableHead>Rasa</TableHead>
                <TableHead className="w-24">Rating</TableHead>
                <TableHead className="w-24">Vote</TableHead>
                <TableHead className="w-24">Sorot</TableHead>
                <TableHead className="w-28">Sembunyi</TableHead>
                <TableHead className="w-32">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {creations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    Belum ada kreasi.
                  </TableCell>
                </TableRow>
              ) : null}
              {creations.map((c, i) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <Input
                      value={c.name}
                      onChange={(e) => {
                        const next = [...creations];
                        next[i] = { ...c, name: e.target.value };
                        setCreations(next);
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={c.creator}
                      onChange={(e) => {
                        const next = [...creations];
                        next[i] = { ...c, creator: e.target.value };
                        setCreations(next);
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={c.taste}
                      onChange={(e) => {
                        const next = [...creations];
                        next[i] = { ...c, taste: e.target.value };
                        setCreations(next);
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.1"
                      value={c.rating}
                      onChange={(e) => {
                        const next = [...creations];
                        next[i] = { ...c, rating: Number(e.target.value) };
                        setCreations(next);
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={c.votes}
                      onChange={(e) => {
                        const next = [...creations];
                        next[i] = { ...c, votes: Number(e.target.value) };
                        setCreations(next);
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={c.is_featured}
                      onCheckedChange={(v) => {
                        const next = [...creations];
                        next[i] = { ...c, is_featured: v };
                        setCreations(next);
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={c.is_hidden}
                      onCheckedChange={(v) => {
                        const next = [...creations];
                        next[i] = { ...c, is_hidden: v };
                        setCreations(next);
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1.5">
                      <Button
                        size="icon"
                        variant="outline"
                        aria-label="Simpan kreasi"
                        onClick={async () => {
                          const res = await upsertCreation({
                            data: {
                              id: c.id,
                              name: c.name,
                              creator: c.creator,
                              taste: c.taste,
                              rating: c.rating,
                              votes: c.votes,
                              is_hidden: c.is_hidden,
                              is_featured: c.is_featured,
                            },
                          });
                          toast[res.ok ? "success" : "error"](
                            res.ok ? "Kreasi disimpan." : "Gagal menyimpan.",
                          );
                        }}
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        aria-label="Hapus kreasi"
                        onClick={async () => {
                          const res = await deleteCreation({ data: { id: c.id } });
                          if (!res.ok) return void toast.error("Gagal menghapus.");
                          toast.success("Kreasi dihapus.");
                          await load();
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </TabsContent>

      <TabsContent value="customers" className="mt-6">
        <div className="overflow-x-auto rounded-2xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>No. HP</TableHead>
                <TableHead>Catatan</TableHead>
                <TableHead className="w-28">Diblokir</TableHead>
                <TableHead className="w-32">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Belum ada pelanggan.
                  </TableCell>
                </TableRow>
              ) : null}
              {customers.map((c, i) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <Input
                      value={c.name}
                      onChange={(e) => {
                        const next = [...customers];
                        next[i] = { ...c, name: e.target.value };
                        setCustomers(next);
                      }}
                    />
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">{c.phone}</TableCell>
                  <TableCell>
                    <Input
                      value={c.note ?? ""}
                      placeholder="Catatan internal"
                      onChange={(e) => {
                        const next = [...customers];
                        next[i] = { ...c, note: e.target.value };
                        setCustomers(next);
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={c.is_blocked}
                      onCheckedChange={(v) => {
                        const next = [...customers];
                        next[i] = { ...c, is_blocked: v };
                        setCustomers(next);
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1.5">
                      <Button
                        size="icon"
                        variant="outline"
                        aria-label="Simpan pelanggan"
                        onClick={async () => {
                          const res = await updateCustomer({
                            data: {
                              id: c.id,
                              name: c.name,
                              note: c.note ?? "",
                              is_blocked: c.is_blocked,
                            },
                          });
                          toast[res.ok ? "success" : "error"](
                            res.ok ? "Pelanggan disimpan." : "Gagal menyimpan.",
                          );
                        }}
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        aria-label="Hapus pelanggan"
                        onClick={async () => {
                          const res = await deleteCustomer({ data: { id: c.id } });
                          if (!res.ok) return void toast.error("Gagal menghapus.");
                          toast.success("Pelanggan dihapus.");
                          await load();
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </TabsContent>
    </Tabs>
  );
}
