"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus, Receipt, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";


export default function DayBookPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [data, setData] = useState<any[]>([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [newAccount, setNewAccount] = useState({ accountName: "", accountType: "Income" });

  const fetchAccounts = async () => {
    try {
      const { data } = await api.get("/api/daybook/accounts");
      setAccounts(data.data || []);
    } catch { setAccounts([]); }
  };

  const fetchData = async (accountId?: string) => {
    setLoading(true);
    try {
      const query = accountId ? `?accountId=${accountId}` : "";
      const { data: res } = await api.get(`/api/daybook/data${query}`);
      setData(res.data || []);
    } catch { setData([]); }
    setLoading(false);
  };

  useEffect(() => { fetchAccounts(); fetchData(); }, []);

  const handleAccountSelect = (id: string) => {
    setSelectedAccount(id);
    fetchData(id || undefined);
  };

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/api/daybook/accounts", newAccount);
      fetchAccounts();
      setShowAddAccount(false);
      setNewAccount({ accountName: "", accountType: "Income" });
    } catch {}
  };

  const totalCredit = data.reduce((sum, d) => sum + (d.credit || 0), 0);
  const totalDebit = data.reduce((sum, d) => sum + (d.debit || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Day Book</h1>
          <p className="text-sm text-muted-foreground mt-1">Track financial transactions</p>
        </div>
        <Button onClick={() => setShowAddAccount(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Account
        </Button>
      </div>

      {/* Account Filter */}
      <div className="flex gap-2 flex-wrap">
        <Button variant={!selectedAccount ? "default" : "outline"} size="sm" onClick={() => handleAccountSelect("")}>All</Button>
        {accounts.map((acc: any) => (
          <Button key={acc._id} variant={selectedAccount === acc._id ? "default" : "outline"} size="sm"
            onClick={() => handleAccountSelect(acc._id)}>
            {acc.accountName} ({acc.accountType})
          </Button>
        ))}
      </div>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Total Credit</p><p className="text-2xl font-bold text-green-600">{formatCurrency(totalCredit)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Total Debit</p><p className="text-2xl font-bold text-red-600">{formatCurrency(totalDebit)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Balance</p><p className="text-2xl font-bold">{formatCurrency(totalCredit - totalDebit)}</p></CardContent></Card>
      </div>

      {/* Transactions */}
      <Card>
        <CardHeader><CardTitle className="text-base font-semibold"><Receipt className="inline h-5 w-5 mr-2" />Transactions</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Receipt</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Narration</TableHead>
                <TableHead className="text-right">Credit</TableHead>
                <TableHead className="text-right">Debit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} className="py-4"><div className="space-y-2"><Skeleton className="h-12 w-full rounded-lg" /><Skeleton className="h-12 w-full rounded-lg" /><Skeleton className="h-12 w-full rounded-lg" /><Skeleton className="h-12 w-full rounded-lg" /></div></TableCell></TableRow>
              ) : data.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-12"><div className="flex flex-col items-center gap-2"><FileText className="h-10 w-10 text-muted-foreground/50" /><p className="text-sm font-medium text-muted-foreground">No transactions found</p><p className="text-xs text-muted-foreground/70">Transactions will appear here once recorded</p></div></TableCell></TableRow>
              ) : (
                data.map((entry: any) => (
                  <TableRow key={entry._id}>
                    <TableCell>{formatDate(entry.dayBookDataDate)}</TableCell>
                    <TableCell>{entry.studentName || "-"}</TableCell>
                    <TableCell>{entry.receiptNumber || "-"}</TableCell>
                    <TableCell>{entry.dayBookAccountId?.accountName || "-"}</TableCell>
                    <TableCell className="text-muted-foreground">{entry.narration || "-"}</TableCell>
                    <TableCell className="text-right text-green-600">{entry.credit > 0 ? formatCurrency(entry.credit) : "-"}</TableCell>
                    <TableCell className="text-right text-red-600">{entry.debit > 0 ? formatCurrency(entry.debit) : "-"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showAddAccount} onOpenChange={setShowAddAccount}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Day Book Account</DialogTitle></DialogHeader>
          <form onSubmit={handleAddAccount} className="space-y-4">
            <div className="space-y-2">
              <Label>Account Name</Label>
              <Input value={newAccount.accountName} onChange={(e) => setNewAccount((p) => ({ ...p, accountName: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label>Account Type</Label>
              <select value={newAccount.accountType} onChange={(e) => setNewAccount((p) => ({ ...p, accountType: e.target.value }))}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="Income">Income</option>
                <option value="Expense">Expense</option>
                <option value="Commission">Commission</option>
              </select>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setShowAddAccount(false)}>Cancel</Button>
              <Button type="submit">Create</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
