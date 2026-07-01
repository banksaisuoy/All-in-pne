'use client';

import { useState } from 'react';
import { useCompletion } from 'ai/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Upload, Sparkles, Wand2 } from 'lucide-react';

export default function MagicUploader() {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const { completion, complete, isLoading, error } = useCompletion({
        api: '/api/upload',
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
        }
    };

    const handleAnalyze = async () => {
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64String = reader.result as string;
            await complete(base64String);
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="container mx-auto p-4 max-w-6xl">
            <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
                <Sparkles className="h-8 w-8 text-blue-600" />
                Magic Product Uploader
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Upload Section */}
                <Card className="md:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle>Upload Image</CardTitle>
                        <CardDescription>Upload a photo and let AI write the details.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-center w-full">
                            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Preview" className="h-full object-contain p-2" />
                                ) : (
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-muted-foreground">
                                        <Upload className="w-10 h-10 mb-2" />
                                        <p className="text-sm">Click or drop image</p>
                                    </div>
                                )}
                                <Input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                            </label>
                        </div>
                        <Button
                            className="w-full"
                            onClick={handleAnalyze}
                            disabled={!file || isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Analyzing with AI...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    Analyze Image
                                </>
                            )}
                        </Button>
                        {error && <p className="text-sm text-destructive text-center">{error.message}</p>}
                    </CardContent>
                </Card>

                {/* AI Streaming Response Section */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>AI Generated Details</CardTitle>
                        <CardDescription>Streaming response from Gemini</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="w-full h-96 p-4 rounded-md border bg-muted/30 overflow-y-auto whitespace-pre-wrap font-mono text-sm">
                            {completion || (isLoading ? 'AI is thinking...' : 'Upload an image to see the magic happen.')}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
