import React, { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import ConfirmDialog from "@/Pages/Admin/Components/Shared/ConfirmDialog";
import {
    ShieldIcon,
    UserCheckIcon,
    UserXIcon,
    AlertCircleIcon,
    CheckCircleIcon,
    InfoIcon,
    SaveIcon,
    HistoryIcon
} from "lucide-react";

/**
 * UserRoleManager Component
 * 
 * Interface for managing user roles and permissions:
 * - Display current user roles
 * - Add/remove role assignments
 * - Role change history
 * - Permission implications
 * - Bulk role operations
 */
export default function UserRoleManager({ 
    user,
    availableRoles = [],
    roleHistory = [],
    onSuccess,
    onCancel,
    className = "" 
}) {
    const [selectedRoles, setSelectedRoles] = useState(
        user.roles ? user.roles.map(role => role.id) : []
    );
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [pendingChanges, setPendingChanges] = useState(false);

    // Handle role selection change
    const handleRoleChange = (roleId, checked) => {
        let newSelectedRoles;
        if (checked) {
            newSelectedRoles = [...selectedRoles, roleId];
        } else {
            newSelectedRoles = selectedRoles.filter(id => id !== roleId);
        }
        setSelectedRoles(newSelectedRoles);
        
        // Check if there are pending changes
        const currentRoleIds = user.roles ? user.roles.map(role => role.id) : [];
        setPendingChanges(
            newSelectedRoles.length !== currentRoleIds.length ||
            !newSelectedRoles.every(id => currentRoleIds.includes(id))
        );
    };

    // Handle form submission
    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            await router.patch(route('admin.users.update-roles', user.id), {
                roles: selectedRoles
            });
            setPendingChanges(false);
            onSuccess?.();
        } catch (error) {
            console.error('Error updating roles:', error);
        } finally {
            setIsLoading(false);
            setShowConfirmDialog(false);
        }
    };

    // Reset to original roles
    const handleReset = () => {
        const currentRoleIds = user.roles ? user.roles.map(role => role.id) : [];
        setSelectedRoles(currentRoleIds);
        setPendingChanges(false);
    };

    // Get role by ID
    const getRoleById = (roleId) => {
        return availableRoles.find(role => role.id === roleId);
    };

    // Get changes summary
    const getChangesSummary = () => {
        const currentRoleIds = user.roles ? user.roles.map(role => role.id) : [];
        const toAdd = selectedRoles.filter(id => !currentRoleIds.includes(id));
        const toRemove = currentRoleIds.filter(id => !selectedRoles.includes(id));
        
        return { toAdd, toRemove };
    };

    const { toAdd, toRemove } = getChangesSummary();

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Pending Changes Alert */}
            {pendingChanges && (
                <Alert>
                    <AlertCircleIcon className="h-4 w-4" />
                    <AlertDescription>
                        You have unsaved role changes. Please save or reset to continue.
                    </AlertDescription>
                </Alert>
            )}

            {/* Current Roles */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ShieldIcon className="h-5 w-5" />
                        Current Roles
                    </CardTitle>
                    <CardDescription>
                        Roles currently assigned to {user.name}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {user.roles && user.roles.length > 0 ? (
                            user.roles.map(role => (
                                <div key={role.id} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Badge variant="default" className="flex items-center gap-1">
                                            <ShieldIcon className="h-3 w-3" />
                                            {role.name}
                                        </Badge>
                                        <div>
                                            <p className="font-medium">{role.display_name || role.name}</p>
                                            {role.description && (
                                                <p className="text-sm text-muted-foreground">{role.description}</p>
                                            )}
                                        </div>
                                    </div>
                                    <Badge variant={selectedRoles.includes(role.id) ? "default" : "destructive"}>
                                        {selectedRoles.includes(role.id) ? "Keeping" : "Removing"}
                                    </Badge>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-6 text-muted-foreground">
                                <UserXIcon className="h-8 w-8 mx-auto mb-2" />
                                <p>No roles currently assigned</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Available Roles */}
            <Card>
                <CardHeader>
                    <CardTitle>Available Roles</CardTitle>
                    <CardDescription>
                        Select roles to assign to the user
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {availableRoles.length > 0 ? (
                            availableRoles.map((role) => (
                                <div key={role.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                                    <Checkbox
                                        id={`role_${role.id}`}
                                        checked={selectedRoles.includes(role.id)}
                                        onCheckedChange={(checked) => handleRoleChange(role.id, checked)}
                                        className="mt-1"
                                    />
                                    <div className="flex-1">
                                        <Label htmlFor={`role_${role.id}`} className="font-medium cursor-pointer">
                                            {role.display_name || role.name}
                                        </Label>
                                        {role.description && (
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {role.description}
                                            </p>
                                        )}
                                        {role.permissions && role.permissions.length > 0 && (
                                            <div className="mt-2">
                                                <p className="text-xs text-muted-foreground mb-1">Permissions:</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {role.permissions.slice(0, 3).map(permission => (
                                                        <Badge key={permission.id} variant="outline" className="text-xs">
                                                            {permission.name}
                                                        </Badge>
                                                    ))}
                                                    {role.permissions.length > 3 && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            +{role.permissions.length - 3} more
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <Badge variant={selectedRoles.includes(role.id) ? "default" : "outline"}>
                                        {selectedRoles.includes(role.id) ? "Selected" : "Available"}
                                    </Badge>
                                </div>
                            ))
                        ) : (
                            <Alert>
                                <InfoIcon className="h-4 w-4" />
                                <AlertDescription>
                                    No roles are available for assignment. Contact your system administrator.
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Changes Preview */}
            {pendingChanges && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircleIcon className="h-5 w-5" />
                            Changes Preview
                        </CardTitle>
                        <CardDescription>
                            Review the role changes that will be applied
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {toAdd.length > 0 && (
                                <div>
                                    <h4 className="font-medium text-green-600 mb-2">Roles to Add:</h4>
                                    <div className="space-y-2">
                                        {toAdd.map(roleId => {
                                            const role = getRoleById(roleId);
                                            return role ? (
                                                <div key={roleId} className="flex items-center gap-2 p-2 bg-green-50 rounded">
                                                    <UserCheckIcon className="h-4 w-4 text-green-600" />
                                                    <span className="font-medium">{role.name}</span>
                                                    {role.description && (
                                                        <span className="text-sm text-muted-foreground">
                                                            - {role.description}
                                                        </span>
                                                    )}
                                                </div>
                                            ) : null;
                                        })}
                                    </div>
                                </div>
                            )}

                            {toRemove.length > 0 && (
                                <div>
                                    <h4 className="font-medium text-red-600 mb-2">Roles to Remove:</h4>
                                    <div className="space-y-2">
                                        {toRemove.map(roleId => {
                                            const role = user.roles?.find(r => r.id === roleId);
                                            return role ? (
                                                <div key={roleId} className="flex items-center gap-2 p-2 bg-red-50 rounded">
                                                    <UserXIcon className="h-4 w-4 text-red-600" />
                                                    <span className="font-medium">{role.name}</span>
                                                    {role.description && (
                                                        <span className="text-sm text-muted-foreground">
                                                            - {role.description}
                                                        </span>
                                                    )}
                                                </div>
                                            ) : null;
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Role History */}
            {roleHistory.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <HistoryIcon className="h-5 w-5" />
                            Role Change History
                        </CardTitle>
                        <CardDescription>
                            Recent role changes for this user
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {roleHistory.slice(0, 5).map((change, index) => (
                                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <p className="font-medium">
                                            {change.action === 'added' ? 'Role Added' : 'Role Removed'}: {change.role_name}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            By {change.admin_name} on {formatDate(change.created_at)}
                                        </p>
                                    </div>
                                    <Badge variant={change.action === 'added' ? 'default' : 'destructive'}>
                                        {change.action}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Form Actions */}
            <div className="flex items-center gap-4">
                <Button 
                    onClick={() => setShowConfirmDialog(true)}
                    disabled={!pendingChanges || isLoading}
                    className="flex items-center gap-2"
                >
                    <SaveIcon className="h-4 w-4" />
                    Save Role Changes
                </Button>
                <Button
                    variant="outline"
                    onClick={handleReset}
                    disabled={!pendingChanges || isLoading}
                >
                    Reset Changes
                </Button>
                <Button
                    variant="secondary"
                    onClick={onCancel}
                    disabled={isLoading}
                >
                    Cancel
                </Button>
            </div>

            {/* Confirmation Dialog */}
            <ConfirmDialog
                isOpen={showConfirmDialog}
                onClose={() => setShowConfirmDialog(false)}
                onConfirm={handleSubmit}
                title="Confirm Role Changes"
                description={`Are you sure you want to update the roles for ${user.name}? This will change their access permissions.`}
                confirmText="Update Roles"
                cancelText="Cancel"
                isLoading={isLoading}
            />
        </div>
    );
}