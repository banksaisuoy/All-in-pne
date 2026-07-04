'use client';

import { useState } from 'react';
import { searchSimilarProducts, SearchResult } from '@/lib/actions/visual-search';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Camera, Search, Loader2 } from 'lucide-react';
import Image from 'next/image';

export default function VisualSearchPage() {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [results, setResults] = useState<SearchResult[]>([]);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
            setResults([]);
            setError(null);
        }
    };

    const handleSearch = async () => {
        if (!file) return;

        setIsSearching(true);
        setError(null);

        try {
            const base64data = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onloadend = () => {
                    resolve(reader.result as string);
                };
                reader.onerror = reject;
            });
            try {
                const searchResults = await searchSimilarProducts(base64data);
                setResults(searchResults);
            } catch (err) {
                console.error(err);
                setError("Failed to find similar products. Please try again.");
            } finally {
                setIsSearching(false);
            }
        } catch (err) {
            console.error(err);
            setError("Error processing image.");
            setIsSearching(false);
        }
    };

    return (
        <div className="container mx-auto p-4 max-w-6xl">
            <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
                <Camera className="h-8 w-8 text-blue-600" />
                Snap to Shop
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Search Input Section */}
                <Card className="md:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle>Find Similar Items</CardTitle>
                        <CardDescription>Upload a photo to find matching products.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-center w-full">
                            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors relative">
                                {previewUrl ? (
                                    <div className="relative w-full h-full p-2">
                                        <Image src={previewUrl} alt="Preview" fill sizes="100vw" className="object-contain" unoptimized />
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-muted-foreground">
                                        <Camera className="w-10 h-10 mb-2" />
                                        <p className="text-sm">Click or drop image</p>
                                    </div>
                                )}
                                <Input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                            </label>
                        </div>
                        <Button
                            className="w-full"
                            onClick={handleSearch}
                            disabled={!file || isSearching}
                        >
                            {isSearching ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <Search className="mr-2 h-4 w-4" />
                                    Search
                                </>
                            )}
                        </Button>
                        {error && <p className="text-sm text-destructive text-center">{error}</p>}
                    </CardContent>
                </Card>

                {/* Results Section */}
                <div className="md:col-span-2 space-y-4">
                    <h2 className="text-xl font-semibold">
                        {isSearching ? "Searching..." : results.length > 0 ? `Found ${results.length} matches` : "Results will appear here"}
                    </h2>

                    {isSearching && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-64 rounded-xl bg-muted animate-pulse" />
                            ))}
                        </div>
                    )}

                    {!isSearching && results.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {results.map((product) => (
                                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                                    <div className="aspect-square relative bg-muted">
                                        {/* In a real app, use Next.js Image component */}
                                        <Image
                                            src={product.imageUrl}
                                            alt={product.name}
                                            fill
                                            sizes="100vw"
                                            className="object-cover"
                                            onError={(e) => {
                                                (e.currentTarget as HTMLImageElement).srcset = '';
                                                (e.currentTarget as HTMLImageElement).src = 'https://placehold.co/400x400?text=No+Image';
                                            }}
                                        />
                                        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                                            {Math.round(product.similarity * 100)}% Match
                                        </div>
                                    </div>
                                    <CardContent className="p-4">
                                        <h3 className="font-semibold truncate">{product.name}</h3>
                                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{product.description}</p>
                                        <div className="mt-3 flex items-center justify-between">
                                            <span className="font-bold text-lg">${product.price}</span>
                                            <Button size="sm" variant="secondary">View</Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {!isSearching && results.length === 0 && previewUrl && !error && (
                        <div className="text-center py-12 text-muted-foreground">
                            <Search className="h-12 w-12 mx-auto mb-2 opacity-20" />
                            <p>No similar products found yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
