'use client';

import { useState } from 'react';
import { generateProductMetadata, saveProductToDb, ProductMetadata } from '@/lib/actions/upload-product';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Upload, Check, Wand2 } from 'lucide-react';
import Image from 'next/image';

export default function MagicUploader() {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [generatedData, setGeneratedData] = useState<ProductMetadata | null>(null);
    const [statusMessage, setStatusMessage] = useState<string>('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
            setGeneratedData(null);
            setStatusMessage('');
        }
    };

    const handleAnalyze = async () => {
        if (!file) return;

        setIsAnalyzing(true);
        setStatusMessage('Sending to Gemini Vision API...');

        try {
            // Convert file to base64
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = async () => {
                const base64data = reader.result as string;
                // Remove the prefix (data:image/jpeg;base64,) if necessary for some APIs,
                // but usually Vercel AI SDK handles it or wants just the base64 part.
                // Depending on config, 'image' part of 'user' content supports data urls.

                try {
                    setStatusMessage('Gemini is analyzing the image...');
                    const metadata = await generateProductMetadata(base64data);
                    setGeneratedData(metadata);
                    setStatusMessage('Analysis complete! Please review.');
                } catch (err) {
                    console.error(err);
                    setStatusMessage('Error analyzing image.');
                } finally {
                    setIsAnalyzing(false);
                }
            };
        } catch (error) {
            console.error(error);
            setIsAnalyzing(false);
            setStatusMessage('Error processing file.');
        }
    };

    const handleSave = async () => {
        if (!generatedData || !previewUrl) return;

        setIsSaving(true);
        setStatusMessage('Saving to Supabase...');

        try {
            // In a real app, upload the image to Supabase Storage first, get the URL
            // const imageUrl = await uploadImageToStorage(file);
            const imageUrl = previewUrl; // Mock for now

            await saveProductToDb({ ...generatedData, imageUrl });
            setStatusMessage('Product successfully published!');
            setFile(null);
            setPreviewUrl(null);
            setGeneratedData(null);
        } catch (error) {
            console.error(error);
            setStatusMessage('Failed to save product.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-8">
            <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
                <Wand2 className="h-8 w-8 text-purple-600" />
                Magic Product Uploader
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column: Upload & Preview */}
                <Card>
                    <CardHeader>
                        <CardTitle>Product Image</CardTitle>
                        <CardDescription>Upload a raw photo. AI will do the rest.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-center w-full">
                            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                                {previewUrl ? (
                                    <div className="relative w-full h-full">
                                        <Image src={previewUrl} alt="Preview" fill unoptimized className="object-contain" sizes="100vw" />
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Upload className="w-8 h-8 mb-4 text-gray-500" />
                                        <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
                                    </div>
                                )}
                                <Input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                            </label>
                        </div>

                        <Button
                            className="w-full"
                            onClick={handleAnalyze}
                            disabled={!file || isAnalyzing || !!generatedData}
                        >
                            {isAnalyzing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Analyzing with Gemini...
                                </>
                            ) : (
                                "Analyze Image"
                            )}
                        </Button>
                        {statusMessage && <p className="text-sm text-center text-muted-foreground">{statusMessage}</p>}
                    </CardContent>
                </Card>

                {/* Right Column: AI Generated Data */}
                <Card className="relative overflow-hidden">
                    <CardHeader>
                        <CardTitle>AI Intelligence</CardTitle>
                        <CardDescription>Generated Metadata</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {generatedData ? (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div>
                                    <label className="text-sm font-medium">Product Name</label>
                                    <Input defaultValue={generatedData.name} />
                                </div>

                                <div>
                                    <label className="text-sm font-medium">Suggested Price</label>
                                    <Input defaultValue={generatedData.price.toString()} type="number" />
                                </div>

                                <div>
                                    <label className="text-sm font-medium">Tags</label>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {generatedData.tags.map(tag => (
                                            <span key={tag} className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium">SEO Description (HTML)</label>
                                    <div className="p-3 bg-muted rounded-md text-sm h-40 overflow-y-auto whitespace-pre-wrap font-mono">
                                        {generatedData.description_html}
                                    </div>
                                </div>

                                <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleSave} disabled={isSaving}>
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Check className="mr-2 h-4 w-4" />
                                            Approve & Publish
                                        </>
                                    )}
                                </Button>
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center text-muted-foreground opacity-50">
                                <div className="text-center">
                                    <Wand2 className="h-12 w-12 mx-auto mb-2" />
                                    <p>Waiting for analysis...</p>
                                </div>
                            </div>
                        )}
                    </CardContent>

                    {/* Loading Overlay for Analysis */}
                    {isAnalyzing && (
                        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                            <div className="text-center">
                                <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                                <p className="mt-4 font-medium animate-pulse">Consulting the oracle...</p>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
