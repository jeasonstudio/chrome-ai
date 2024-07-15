'use client';

// import 'chrome-ai/polyfill';
import { LoaderCircle, SquareKanban } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Layout } from '../components/layout';
import React from 'react';
import { CoreMessage, streamObject } from 'ai';
import {
  Settings,
  useSettingsForm,
  useSettingsModel,
} from '../components/settings';
import { z } from 'zod';
import { Outputs } from '../components/outputs';

const schema = z.object({
  name: z.string({ description: 'customer name' }),
  email: z.string(),
  type: z.string({ description: 'Sale, Refund or Subscription' }),
  status: z.string({ description: 'Fulfilled, Declined or Active' }),
  date: z.string(),
  amount: z.number({ description: 'order amount in USD, example: 250' }),
});

const OrdersPage: React.FC<unknown> = () => {
  const form = useSettingsForm({
    temperature: 0.2,
    topK: 3,
    content: '',
  });
  const model = useSettingsModel(form);
  const [orders, setOrders] = React.useState<Partial<z.infer<typeof schema>>[]>(
    []
  );
  const [loading, setLoading] = React.useState(false);

  const onGenerate = async () => {
    const userMessage: CoreMessage = {
      role: 'user',
      content: 'generate more than 3 orders',
    };
    const [role, roleContent] = form.getValues(['role', 'content']);
    const systemMessage: CoreMessage = { role, content: roleContent };

    const messages = [systemMessage, userMessage];

    try {
      setLoading(true);
      const startTimestamp = Date.now();
      const { partialObjectStream } = await streamObject({
        model,
        schema: z.object({ orders: z.array(schema) }),
        messages,
      });
      for await (const partialObject of partialObjectStream) {
        const orders = partialObject.orders ?? [];
        setOrders(orders as any);
      }
      setLoading(false);
      const cost = Date.now() - startTimestamp;
      console.log('cost:', cost, 'ms');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <main className="grid flex-1 gap-4 overflow-auto p-4 md:grid-cols-2 lg:grid-cols-3 h-screen">
        <Settings form={form} />
        <Outputs>
          <div className="mb-2">
            {loading ? (
              <Button size="sm" className="ml-auto" disabled={loading}>
                <LoaderCircle className="animate-spin size-3.5 mr-1" />
                Generating...
              </Button>
            ) : (
              <Button type="submit" size="sm" onClick={onGenerate}>
                <SquareKanban className="size-3.5 mr-1" />
                Generate Orders
              </Button>
            )}
          </div>

          <Card>
            <CardHeader className="px-7">
              <CardTitle>Orders</CardTitle>
              <CardDescription>Recent orders from your store.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead className="hidden sm:table-cell">Type</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Status
                    </TableHead>
                    <TableHead className="hidden md:table-cell">Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order?.name}>
                      <TableCell>
                        <div className="font-medium">{order?.name}</div>
                        <div className="hidden text-sm text-muted-foreground md:inline">
                          {order?.email}
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {order?.type}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge className="text-xs" variant="secondary">
                          {order?.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {order?.date}
                      </TableCell>
                      <TableCell className="text-right">
                        ${order?.amount}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Outputs>
      </main>
    </Layout>
  );
};

export default OrdersPage;
