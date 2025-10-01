import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Checkbox } from '../ui/Checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/Dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Toast, ToastAction, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from '../ui/Toast';
import { Label } from '@radix-ui/react-label';
import { Separator } from '@radix-ui/react-separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';

export function RadixUIDemo() {
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const [selectedValue, setSelectedValue] = useState('');
  const [toastOpen, setToastOpen] = useState(false);

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Radix UI Components Demo</h1>
        <p className="text-gray-600">Examples of how to use Radix UI components in your project</p>
      </div>

      {/* Buttons */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <Button>Default Button</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
        <div className="flex flex-wrap gap-4">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
        </div>
      </section>

      <Separator />

      {/* Checkbox */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Checkbox</h2>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="terms"
            checked={checkboxChecked}
            onCheckedChange={setCheckboxChecked}
          />
          <Label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Accept terms and conditions
          </Label>
        </div>
        <p className="text-sm text-gray-600">
          Checkbox is {checkboxChecked ? 'checked' : 'unchecked'}
        </p>
      </section>

      <Separator />

      {/* Select */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Select</h2>
        <Select value={selectedValue} onValueChange={setSelectedValue}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select a fruit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="apple">Apple</SelectItem>
            <SelectItem value="banana">Banana</SelectItem>
            <SelectItem value="orange">Orange</SelectItem>
            <SelectItem value="grape">Grape</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-gray-600">
          Selected: {selectedValue || 'None'}
        </p>
      </section>

      <Separator />

      {/* Dialog */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Dialog</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open Dialog</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
              <DialogDescription>
                Make changes to your profile here. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <input
                  id="name"
                  defaultValue="Pedro Duarte"
                  className="col-span-3 px-3 py-2 border rounded-md"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">
                  Username
                </Label>
                <input
                  id="username"
                  defaultValue="@peduarte"
                  className="col-span-3 px-3 py-2 border rounded-md"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </section>

      <Separator />

      {/* Tabs */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Tabs</h2>
        <Tabs defaultValue="account" className="w-[400px]">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="account" className="mt-4 p-4 border rounded-md">
            <p className="text-sm text-gray-600">
              Make changes to your account here. Click save when you're done.
            </p>
          </TabsContent>
          <TabsContent value="password" className="mt-4 p-4 border rounded-md">
            <p className="text-sm text-gray-600">
              Change your password here. After saving, you'll be logged out.
            </p>
          </TabsContent>
          <TabsContent value="settings" className="mt-4 p-4 border rounded-md">
            <p className="text-sm text-gray-600">
              Manage your settings and preferences here.
            </p>
          </TabsContent>
        </Tabs>
      </section>

      <Separator />

      {/* Avatar */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Avatar</h2>
        <div className="flex gap-4">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
        </div>
      </section>

      <Separator />

      {/* Toast */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Toast</h2>
        <ToastProvider>
          <Button
            onClick={() => setToastOpen(true)}
            variant="outline"
          >
            Show Toast
          </Button>
          <Toast open={toastOpen} onOpenChange={setToastOpen}>
            <ToastTitle>Scheduled: Catch up</ToastTitle>
            <ToastDescription>
              Friday, February 10, 2023 at 5:57 PM
            </ToastDescription>
            <ToastAction altText="Goto schedule to undo">
              Undo
            </ToastAction>
          </Toast>
          <ToastViewport />
        </ToastProvider>
      </section>
    </div>
  );
}
