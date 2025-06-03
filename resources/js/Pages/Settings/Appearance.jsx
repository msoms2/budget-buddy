import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
    Palette,
    Sun,
    Moon,
    Monitor,
    FolderIcon,
    Eye,
    CheckCircle,
    Save
} from 'lucide-react';

export default function Appearance({ data, setData, processing, handleSubmit, handleThemeChange }) {
    return (
        <form onSubmit={handleSubmit}>
            <Card className="shadow-sm">
            <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                        <Palette className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                        <CardTitle className="text-xl">Appearance Settings</CardTitle>
                        <CardDescription>
                            Customize the visual appearance of your application.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Theme Selection */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Sun className="h-5 w-5 text-muted-foreground" />
                        <h4 className="font-medium">Theme Preference</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { 
                                value: 'light', 
                                label: 'Light', 
                                icon: Sun,
                                preview: 'bg-white border-2',
                                description: 'Clean and bright interface'
                            },
                            { 
                                value: 'dark', 
                                label: 'Dark', 
                                icon: Moon,
                                preview: 'bg-gray-900 border-2',
                                description: 'Easy on the eyes'
                            },
                            { 
                                value: 'system', 
                                label: 'System', 
                                icon: Monitor,
                                preview: 'bg-gradient-to-br from-white to-gray-900 border-2',
                                description: 'Follows system preference'
                            }
                        ].map((themeOption) => {
                            const IconComponent = themeOption.icon;
                            const isSelected = data.theme === themeOption.value;
                            
                            return (
                                <div
                                    key={themeOption.value}
                                    className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all hover:shadow-md ${
                                        isSelected 
                                            ? 'border-purple-500 ring-2 ring-purple-500/20 shadow-md' 
                                            : 'border-border hover:border-purple-300'
                                    }`}
                                    onClick={() => handleThemeChange(themeOption.value)}
                                >
                                    <div className={`h-20 rounded-md mb-3 ${themeOption.preview} flex items-center justify-center`}>
                                        <IconComponent className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <div className="text-center">
                                        <p className="font-medium">{themeOption.label}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {themeOption.description}
                                        </p>
                                    </div>
                                    {isSelected && (
                                        <div className="absolute top-2 right-2">
                                            <CheckCircle className="h-5 w-5 text-purple-600" />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <Separator />

                {/* Font Settings */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <FolderIcon className="h-5 w-5 text-muted-foreground" />
                        <h4 className="font-medium">Typography</h4>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div>
                            <p className="font-medium text-sm">Font Family</p>
                            <p className="text-xs text-muted-foreground">Choose your preferred font</p>
                        </div>
                        <Select defaultValue="inter">
                            <SelectTrigger className="w-32">
                                <SelectValue placeholder="Select font" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="inter">Inter</SelectItem>
                                <SelectItem value="manrope">Manrope</SelectItem>
                                <SelectItem value="system">System</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Accessibility */}
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-2">
                        <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <h4 className="font-medium text-blue-900 dark:text-blue-100">Accessibility</h4>
                    </div>
                    <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                        Additional accessibility features will be available in future updates.
                    </p>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-blue-800 dark:text-blue-200">High contrast mode</span>
                            <Switch disabled />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-blue-800 dark:text-blue-200">Reduce motion</span>
                            <Switch disabled />
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="bg-muted/30">
                <Button type="submit" disabled={processing} className="flex items-center gap-2" onClick={handleSubmit}>
                    <Save className="h-4 w-4" />
                    {processing ? 'Saving...' : 'Save Appearance'}
                </Button>
            </CardFooter>
            </Card>
        </form>
    );
}
