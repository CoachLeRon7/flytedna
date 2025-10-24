import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface DomainScore {
  domain: string;
  label: string;
  self: number;
  peer?: number;
  coach?: number;
  final: number;
}

interface DomainBreakdownTableProps {
  scores: DomainScore[];
  userRole: string;
}

export function DomainBreakdownTable({ scores, userRole }: DomainBreakdownTableProps) {
  const getComparisonIcon = (self: number, external?: number) => {
    if (!external) return null;
    const diff = external - self;
    if (diff > 0.3) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (diff < -0.3) return <TrendingDown className="h-4 w-4 text-orange-600" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 4.5) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    if (score >= 3.8) return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    if (score >= 3.0) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>360° Domain Breakdown</CardTitle>
        <CardDescription>
          Compare your self-assessment with peer and coach perspectives
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">Domain</TableHead>
                <TableHead className="text-center">Self</TableHead>
                {userRole !== 'student' && <TableHead className="text-center">Peer Avg</TableHead>}
                {userRole !== 'student' && <TableHead className="text-center">Coach</TableHead>}
                <TableHead className="text-center">Final Score</TableHead>
                <TableHead className="text-center">Alignment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scores.map((score) => {
                const peerDiff = score.peer ? score.peer - score.self : null;
                const coachDiff = score.coach ? score.coach - score.self : null;
                
                return (
                  <TableRow key={score.domain}>
                    <TableCell className="font-medium">{score.label}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={getScoreBadgeColor(score.self)}>
                        {score.self.toFixed(2)}
                      </Badge>
                    </TableCell>
                    {userRole !== 'student' && (
                      <TableCell className="text-center">
                        {score.peer ? (
                          <Badge variant="outline" className={getScoreBadgeColor(score.peer)}>
                            {score.peer.toFixed(2)}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">N/A</span>
                        )}
                      </TableCell>
                    )}
                    {userRole !== 'student' && (
                      <TableCell className="text-center">
                        {score.coach ? (
                          <Badge variant="outline" className={getScoreBadgeColor(score.coach)}>
                            {score.coach.toFixed(2)}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">N/A</span>
                        )}
                      </TableCell>
                    )}
                    <TableCell className="text-center">
                      <Badge className={getScoreBadgeColor(score.final)}>
                        {score.final.toFixed(2)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        {score.peer && (
                          <div className="flex items-center gap-1" title={`Peer: ${peerDiff! > 0 ? '+' : ''}${peerDiff!.toFixed(2)}`}>
                            {getComparisonIcon(score.self, score.peer)}
                          </div>
                        )}
                        {score.coach && (
                          <div className="flex items-center gap-1" title={`Coach: ${coachDiff! > 0 ? '+' : ''}${coachDiff!.toFixed(2)}`}>
                            {getComparisonIcon(score.self, score.coach)}
                          </div>
                        )}
                        {!score.peer && !score.coach && (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
