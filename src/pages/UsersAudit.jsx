import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search, Users, ScrollText } from 'lucide-react';
import EmptyState from '@/components/shared/EmptyState';
import StatusBadge from '@/components/shared/StatusBadge';
import { format } from 'date-fns';

export default function UsersAudit() {
    const [search, setSearch] = useState('');

    const { data: users = [] } = useQuery({
        queryKey: ['users'],
        queryFn: () => base44.entities.User.list(),
    });

    const { data: logs = [] } = useQuery({
        queryKey: ['audit-logs'],
        queryFn: () => base44.entities.AuditLog.list('-created_date', 100),
    });

    const filteredUsers = users.filter(u => {
        if (!search) return true;
        return [u.full_name, u.email, u.role].some(f => (f || '').toLowerCase().includes(search.toLowerCase()));
    });

    const filteredLogs = logs.filter(l => {
        if (!search) return true;
        return [l.action, l.user_name, l.entity_type, l.details].some(f => (f || '').toLowerCase().includes(search.toLowerCase()));
    });

    return (
        <div>
            <div className="mb-4">
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users or logs..." className="pl-9 h-9" />
                </div>
            </div>

            <Tabs defaultValue="users">
                <TabsList className="mb-4">
                    <TabsTrigger value="users">Users ({users.length})</TabsTrigger>
                    <TabsTrigger value="audit">Audit Trail ({logs.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="users">
                    {filteredUsers.length === 0 ? (
                        <EmptyState icon={Users} title="No users found" />
                    ) : (
                        <Card className="overflow-hidden">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/50">
                                            <TableHead className="text-xs">Name</TableHead>
                                            <TableHead className="text-xs">Email</TableHead>
                                            <TableHead className="text-xs">Role</TableHead>
                                            <TableHead className="text-xs">Joined</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredUsers.map(u => (
                                            <TableRow key={u.id}>
                                                <TableCell className="text-xs font-medium">{u.full_name || '—'}</TableCell>
                                                <TableCell className="text-xs">{u.email}</TableCell>
                                                <TableCell><StatusBadge status={u.role || 'user'} /></TableCell>
                                                <TableCell className="text-xs">{u.created_date ? format(new Date(u.created_date), 'dd MMM yyyy') : '—'}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="audit">
                    {filteredLogs.length === 0 ? (
                        <EmptyState icon={ScrollText} title="No audit logs" description="Actions will be recorded here" />
                    ) : (
                        <Card className="overflow-hidden">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/50">
                                            <TableHead className="text-xs">Timestamp</TableHead>
                                            <TableHead className="text-xs">User</TableHead>
                                            <TableHead className="text-xs">Action</TableHead>
                                            <TableHead className="text-xs">Entity</TableHead>
                                            <TableHead className="text-xs">Details</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredLogs.map(l => (
                                            <TableRow key={l.id}>
                                                <TableCell className="text-xs">{l.created_date ? format(new Date(l.created_date), 'dd MMM yyyy HH:mm') : '—'}</TableCell>
                                                <TableCell className="text-xs">{l.user_name || l.user_email || '—'}</TableCell>
                                                <TableCell className="text-xs font-medium">{l.action}</TableCell>
                                                <TableCell className="text-xs">{l.entity_type}</TableCell>
                                                <TableCell className="text-xs text-muted-foreground truncate max-w-[200px]">{l.details || '—'}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
