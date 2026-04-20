import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppHeader } from "@/components/AppHeader";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatPercent } from "@/lib/calculations";

interface SnapshotRow {
  id: string;
  created_at: string;
  net_worth: number;
  savings_rate: number;
  health_score: number;
  cash_savings: number;
  total_investments: number;
  total_debt: number;
  monthly_take_home: number;
}

interface ChartPoint {
  date: string;
  fullDate: string;
  netWorth: number;
  savingsRate: number;
  healthScore: number;
  cash: number;
  investments: number;
  debt: number;
}

export default function History() {
  const { user, loading: authLoading } = useAuth();
  const [snapshots, setSnapshots] = useState<SnapshotRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !user) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("financial_snapshots")
        .select(
          "id, created_at, net_worth, savings_rate, health_score, cash_savings, total_investments, total_debt, monthly_take_home",
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });
      if (cancelled) return;
      if (error) {
        console.error("Failed to load snapshots:", error);
        setSnapshots([]);
      } else {
        setSnapshots((data as SnapshotRow[]) ?? []);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  const points: ChartPoint[] = useMemo(
    () =>
      snapshots.map((s) => {
        const d = new Date(s.created_at);
        return {
          date: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
          fullDate: d.toLocaleString(),
          netWorth: Number(s.net_worth) || 0,
          savingsRate: Number(s.savings_rate) || 0,
          healthScore: Number(s.health_score) || 0,
          cash: Number(s.cash_savings) || 0,
          investments: Number(s.total_investments) || 0,
          debt: -(Number(s.total_debt) || 0),
        };
      }),
    [snapshots],
  );

  const reverseSnapshots = useMemo(() => [...snapshots].reverse(), [snapshots]);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container py-8 space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Your history</h1>
            <p className="text-muted-foreground mt-1">
              A snapshot is recorded every time you update your checkup.
            </p>
          </div>
          <Button asChild variant="secondary">
            <Link to="/checkup">Update checkup</Link>
          </Button>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        ) : snapshots.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No snapshots yet. Complete or update your{" "}
              <Link to="/checkup" className="text-accent underline">
                checkup
              </Link>{" "}
              to start tracking over time.
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Net worth over time</CardTitle>
              </CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={points} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickFormatter={(v) => formatCurrency(v)}
                      width={80}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                      formatter={(value: number) => formatCurrency(value)}
                      labelFormatter={(_, payload) =>
                        (payload?.[0]?.payload as ChartPoint | undefined)?.fullDate ?? ""
                      }
                    />
                    <Line
                      type="monotone"
                      dataKey="netWorth"
                      stroke="hsl(var(--accent))"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Savings rate</CardTitle>
                </CardHeader>
                <CardContent className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={points} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickFormatter={(v) => `${Math.round(v)}%`}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--background))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                        formatter={(value: number) => formatPercent(value)}
                      />
                      <Line
                        type="monotone"
                        dataKey="savingsRate"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Health score</CardTitle>
                </CardHeader>
                <CardContent className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={points} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        domain={[0, 100]}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--background))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="healthScore"
                        stroke="hsl(var(--accent))"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Net worth breakdown</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Cash + investments stacked above zero; debt shown below.
                </p>
              </CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={points} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickFormatter={(v) => formatCurrency(v)}
                      width={80}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                      formatter={(value: number, name) => [formatCurrency(Math.abs(value)), name]}
                    />
                    <Area
                      type="monotone"
                      dataKey="cash"
                      stackId="positive"
                      name="Cash"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary) / 0.4)"
                    />
                    <Area
                      type="monotone"
                      dataKey="investments"
                      stackId="positive"
                      name="Investments"
                      stroke="hsl(var(--accent))"
                      fill="hsl(var(--accent) / 0.4)"
                    />
                    <Area
                      type="monotone"
                      dataKey="debt"
                      stackId="negative"
                      name="Debt"
                      stroke="hsl(var(--destructive))"
                      fill="hsl(var(--destructive) / 0.3)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>All snapshots</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Net worth</TableHead>
                      <TableHead className="text-right">Cash</TableHead>
                      <TableHead className="text-right">Investments</TableHead>
                      <TableHead className="text-right">Debt</TableHead>
                      <TableHead className="text-right">Savings rate</TableHead>
                      <TableHead className="text-right">Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reverseSnapshots.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="whitespace-nowrap">
                          {new Date(s.created_at).toLocaleString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatCurrency(Number(s.net_worth))}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatCurrency(Number(s.cash_savings))}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatCurrency(Number(s.total_investments))}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatCurrency(Number(s.total_debt))}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatPercent(Number(s.savings_rate))}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {Math.round(Number(s.health_score))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
