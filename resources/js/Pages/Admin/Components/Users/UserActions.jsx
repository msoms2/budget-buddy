import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ActionMenu from "@/Pages/Admin/Components/Shared/ActionMenu";
import ConfirmDialog from "@/Pages/Admin/Components/Shared/ConfirmDialog";
import { Link, router } from "@inertiajs/react";
import {
    SettingsIcon,
    EditIcon,
    TrashIcon,
    ShieldIcon,
    LockIcon,
    UnlockIcon,
    MailIcon,
    UserCheckIcon,
    UserXIcon,
    KeyIcon,
    CopyIcon,
    RefreshCwIcon
} from "lucide-react";

/**
 * UserActions Component
 * 
 * Provides user management actions including:
 * - Edit user profile
 * - Role management
 * - Account status controls
 * - Password reset
 * - Account deletion
 * - Security actions
 */
export default function UserActions({ user, availableRoles = [], onUserUpdate, className = "" }) {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
    const [showResetPasswordDialog, setShowResetPasswordDialog] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Handle user deletion
    const handleDeleteUser = async () => {
        setIsLoading(true);
        try {
            await router.delete(route('admin.users.destroy', user.id));
            onUserUpdate?.();
        } catch (error) {
            console.error('Error deleting user:', error);
        } finally {
            setIsLoading(false);
            setShowDeleteDialog(false);
        }
    };

    // Handle account deactivation/activation
    const handleToggleAccountStatus = async () => {
        setIsLoading(true);
        try {
            await router.patch(route('admin.users.toggle-status', user.id));
            onUserUpdate?.();
        } catch (error) {
            console.error('Error toggling account status:', error);
        } finally {
            setIsLoading(false);
            setShowDeactivateDialog(false);
        }
    };

    // Handle password reset
    const handleResetPassword = async () => {
        setIsLoading(true);
        try {
            await router.post(route('admin.users.reset-password', user.id));
            onUserUpdate?.();
        } catch (error) {
            console.error('Error resetting password:', error);
        } finally {
            setIsLoading(false);
            setShowResetPasswordDialog(false);
        }
    };

    // Handle email verification resend
    const handleResendVerification = async () => {
        setIsLoading(true);
        try {
            await router.post(route('admin.users.resend-verification', user.id));
        } catch (error) {
            console.error('Error resending verification:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle role assignment
    const handleRoleChange = async (roleId, action) => {
        setIsLoading(true);
        try {
            if (action === 'assign') {
                await router.post(route('admin.users.assign-role', user.id), { role_id: roleId });
            } else {
                await router.delete(route('admin.users.remove-role', user.id), { 
                    data: { role_id: roleId } 
                });
            }
            onUserUpdate?.();
        } catch (error) {
            console.error('Error updating user roles:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Get user status info
    const getUserStatus = () => {
        if (user.deleted_at) {
            return { status: 'deleted', color: 'destructive', text: 'Deleted' };
        }
        if (user.suspended_at) {
            return { status: 'suspended', color: 'destructive', text: 'Suspended' };
        }
        if (!user.email_verified_at) {
            return { status: 'unverified', color: 'secondary', text: 'Unverified' };
        }
        return { status: 'active', color: 'default', text: 'Active' };
    };

    const userStatus = getUserStatus();

    // Primary action menu items
    const primaryActions = [
        {
            label: 'Edit Profile',
            icon: EditIcon,
            href: route('admin.users.edit', user.id),
            description: 'Edit user profile information'
        },
        {
            label: 'Manage Roles',
            icon: ShieldIcon,
            onClick: () => {}, // Will open role management modal
            description: 'Assign or remove user roles'
        },
        {
            label: 'Reset Password',
            icon: KeyIcon,
            onClick: () => setShowResetPasswordDialog(true),
            description: 'Send password reset email'
        }
    ];

    // Secondary action menu items
    const secondaryActions = [
        {
            label: user.email_verified_at ? 'Verified' : 'Resend Verification',
            icon: MailIcon,
            onClick: user.email_verified_at ? null : handleResendVerification,
            disabled: user.email_verified_at || isLoading,
            description: user.email_verified_at ? 'Email is verified' : 'Resend verification email'
        },
        {
            label: userStatus.status === 'active' ? 'Suspend Account' : 'Activate Account',
            icon: userStatus.status === 'active' ? LockIcon : UnlockIcon,
            onClick: () => setShowDeactivateDialog(true),
            disabled: user.deleted_at || isLoading,
            variant: userStatus.status === 'active' ? 'destructive' : 'default',
            description: userStatus.status === 'active' ? 'Suspend user account' : 'Reactivate user account'
        },
        {
            label: 'Delete Account',
            icon: TrashIcon,
            onClick: () => setShowDeleteDialog(true),
            disabled: user.deleted_at || isLoading,
            variant: 'destructive',
            description: 'Permanently delete user account'
        }
    ];

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Account Status Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                        <SettingsIcon className="h-5 w-5" />
                        Account Management
                    </CardTitle>
                    <CardDescription>
                        Manage user account settings and permissions
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {/* Account Status */}
                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <div>
                                <h4 className="font-medium">Account Status</h4>
                                <p className="text-sm text-muted-foreground">
                                    Current account status and verification state
                                </p>
                            </div>
                            <Badge variant={userStatus.color}>
                                {userStatus.text}
                            </Badge>
                        </div>

                        {/* User Roles */}
                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <div>
                                <h4 className="font-medium">User Roles</h4>
                                <p className="text-sm text-muted-foreground">
                                    Assigned permissions and access levels
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-1">
                                {user.roles && user.roles.length > 0 ? (
                                    user.roles.map(role => (
                                        <Badge key={role.id} variant="default" className="flex items-center gap-1">
                                            <ShieldIcon className="h-3 w-3" />
                                            {role.name}
                                        </Badge>
                                    ))
                                ) : (
                                    <Badge variant="outline">No roles assigned</Badge>
                                )}
                            </div>
                        </div>

                        {/* Email Verification Status */}
                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <div>
                                <h4 className="font-medium">Email Verification</h4>
                                <p className="text-sm text-muted-foreground">
                                    Email address verification status
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                {user.email_verified_at ? (
                                    <Badge variant="default" className="flex items-center gap-1">
                                        <UserCheckIcon className="h-3 w-3" />
                                        Verified
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary" className="flex items-center gap-1">
                                        <UserXIcon className="h-3 w-3" />
                                        Unverified
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card>
                <CardHeader>
                    <CardTitle>Available Actions</CardTitle>
                    <CardDescription>
                        User management actions and operations
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {/* Primary Actions */}
                        <div>
                            <h4 className="font-medium mb-3">Primary Actions</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {primaryActions.map((action, index) => (
                                    <Button
                                        key={index}
                                        variant="outline"
                                        className="flex items-center gap-2 p-4 h-auto flex-col text-left"
                                        asChild={!!action.href}
                                        onClick={action.onClick}
                                        disabled={action.disabled || isLoading}
                                    >
                                        {action.href ? (
                                            <Link href={action.href} className="flex items-center gap-2 flex-col w-full">
                                                <action.icon className="h-5 w-5" />
                                                <div>
                                                    <div className="font-medium">{action.label}</div>
                                                    <div className="text-xs text-muted-foreground">{action.description}</div>
                                                </div>
                                            </Link>
                                        ) : (
                                            <>
                                                <action.icon className="h-5 w-5" />
                                                <div>
                                                    <div className="font-medium">{action.label}</div>
                                                    <div className="text-xs text-muted-foreground">{action.description}</div>
                                                </div>
                                            </>
                                        )}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Secondary Actions */}
                        <div>
                            <h4 className="font-medium mb-3">Security Actions</h4>
                            <div className="space-y-2">
                                {secondaryActions.map((action, index) => (
                                    <Button
                                        key={index}
                                        variant={action.variant || "outline"}
                                        size="sm"
                                        className="w-full justify-start"
                                        onClick={action.onClick}
                                        disabled={action.disabled}
                                    >
                                        <action.icon className="h-4 w-4 mr-2" />
                                        {action.label}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Confirmation Dialogs */}
            <ConfirmDialog
                isOpen={showDeleteDialog}
                onClose={() => setShowDeleteDialog(false)}
                onConfirm={handleDeleteUser}
                title="Delete User Account"
                description={`Are you sure you want to permanently delete ${user.name}'s account? This action cannot be undone and will remove all associated data.`}
                confirmText="Delete Account"
                cancelText="Cancel"
                isDestructive={true}
                isLoading={isLoading}
            />

            <ConfirmDialog
                isOpen={showDeactivateDialog}
                onClose={() => setShowDeactivateDialog(false)}
                onConfirm={handleToggleAccountStatus}
                title={userStatus.status === 'active' ? "Suspend User Account" : "Activate User Account"}
                description={
                    userStatus.status === 'active'
                        ? `Are you sure you want to suspend ${user.name}'s account? They will no longer be able to access the system.`
                        : `Are you sure you want to reactivate ${user.name}'s account? They will regain access to the system.`
                }
                confirmText={userStatus.status === 'active' ? "Suspend Account" : "Activate Account"}
                cancelText="Cancel"
                isDestructive={userStatus.status === 'active'}
                isLoading={isLoading}
            />

            <ConfirmDialog
                isOpen={showResetPasswordDialog}
                onClose={() => setShowResetPasswordDialog(false)}
                onConfirm={handleResetPassword}
                title="Reset User Password"
                description={`Send a password reset email to ${user.email}? The user will receive instructions to set a new password.`}
                confirmText="Send Reset Email"
                cancelText="Cancel"
                isLoading={isLoading}
            />
        </div>
    );
}