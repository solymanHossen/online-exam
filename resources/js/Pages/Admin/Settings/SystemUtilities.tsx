import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, CheckCircle2, HardDrive, RefreshCw, Zap } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import axios from 'axios';

interface Props {
    queueConnection: string;
    appDebug: boolean;
}

export default function SystemUtilities({ queueConnection, appDebug }: Props) {
    const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const { data, setData, post, processing } = useForm({
        queue_connection: queueConnection,
    });

    const handleAction = async (endpoint: string, successMessage: string) => {
        setIsLoading(true);
        setStatus(null);
        try {
            const response = await axios.post(route(endpoint));
            setStatus({ type: 'success', message: response.data.message || successMessage });
        } catch (error: any) {
            setStatus({
                type: 'error',
                message: error.response?.data?.message || 'An error occurred during the operation.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleEnvUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.system-utilities.update-env'), {
            onSuccess: () => setStatus({ type: 'success', message: 'Environment settings updated successfully.' }),
            onError: (errors) => setStatus({ type: 'error', message: errors.queue_connection || 'Failed to update settings.' })
        });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">System Utilities</h2>}
        >
            <Head title="System Utilities" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">

                    {status && (
                        <Alert variant={status.type === 'error' ? 'destructive' : 'default'} className={status.type === 'success' ? 'border-green-500 text-green-700' : ''}>
                            {status.type === 'error' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4 text-green-500" />}
                            <AlertTitle>{status.type === 'error' ? 'Error' : 'Success'}</AlertTitle>
                            <AlertDescription>{status.message}</AlertDescription>
                        </Alert>
                    )}

                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Maintenance Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Zap className="h-5 w-5 text-amber-500" />
                                    Quick Actions
                                </CardTitle>
                                <CardDescription>Perform common system maintenance tasks instantly.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex flex-col space-y-3">
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start"
                                        onClick={() => handleAction('admin.system-utilities.clear-caches', 'Caches cleared.')}
                                        disabled={isLoading}
                                    >
                                        <RefreshCw className="mr-2 h-4 w-4" />
                                        Clear Application Caches
                                    </Button>
                                    <p className="text-sm text-gray-500">Removes cached views, config, and routes. Useful if UI changes aren't appearing.</p>
                                </div>
                                <hr />
                                <div className="flex flex-col space-y-3">
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start"
                                        onClick={() => handleAction('admin.system-utilities.link-storage', 'Storage linked.')}
                                        disabled={isLoading}
                                    >
                                        <HardDrive className="mr-2 h-4 w-4" />
                                        Create Storage Link
                                    </Button>
                                    <p className="text-sm text-gray-500">Essential for Shared Hosting (cPanel). Makes uploaded files accessible to the public.</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Environment Settings */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <HardDrive className="h-5 w-5 text-blue-500" />
                                    Environment Configuration
                                </CardTitle>
                                <CardDescription>Safely modify internal .env variables without SSH access.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleEnvUpdate} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="queue_connection">Queue Connection (Job Processing)</Label>
                                        <Select
                                            value={data.queue_connection}
                                            onValueChange={(val) => setData('queue_connection', val)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select connection type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="sync">Synchronous (Slower page loads, no setup required)</SelectItem>
                                                <SelectItem value="database">Database Queue (Fast page loads, requires Cron Job)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <p className="text-sm text-gray-500 mt-2">
                                            If set to 'Database Queue', you must set up a cPanel Cron Job running every minute: <br />
                                            <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">wget -qO- {window.location.origin}/cron/process-queue</code>
                                        </p>
                                    </div>

                                    <Button type="submit" disabled={processing} className="w-full">
                                        Save Environment Settings
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
