import React, { useState, useRef, useCallback } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { RotateCcw, RotateCw, ZoomIn, ZoomOut, Crop, X } from 'lucide-react';

const ImageCropModal = ({ 
    isOpen, 
    onClose, 
    imageSrc, 
    onCropComplete, 
    aspectRatio = 1, // Default to square crop
    minWidth = 100,
    minHeight = 100 
}) => {
    const [crop, setCrop] = useState({
        unit: '%',
        width: 90,
        height: 90,
        x: 5,
        y: 5
    });
    const [completedCrop, setCompletedCrop] = useState(null);
    const [scale, setScale] = useState(1);
    const [rotate, setRotate] = useState(0);
    const imgRef = useRef(null);
    const canvasRef = useRef(null);

    const onImageLoad = useCallback((e) => {
        const { width, height } = e.currentTarget;
        const initialCrop = {
            unit: '%',
            width: 90,
            height: 90,
            x: 5,
            y: 5,
        };
        setCrop(initialCrop);
        
        // Set initial completed crop so button is enabled
        const pixelCrop = {
            unit: 'px',
            x: (width * initialCrop.x) / 100,
            y: (height * initialCrop.y) / 100,
            width: (width * initialCrop.width) / 100,
            height: (height * initialCrop.height) / 100,
        };
        setCompletedCrop(pixelCrop);
    }, []);

    const getCroppedImg = useCallback(async () => {
        const image = imgRef.current;
        const canvas = canvasRef.current;
        
        if (!image || !canvas || !completedCrop) {
            return null;
        }

        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;

        const ctx = canvas.getContext('2d');
        
        // Set canvas size to the crop size
        canvas.width = completedCrop.width * scaleX;
        canvas.height = completedCrop.height * scaleY;

        ctx.imageSmoothingQuality = 'high';
        
        // Apply transformations
        if (rotate !== 0) {
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate((rotate * Math.PI) / 180);
            ctx.translate(-canvas.width / 2, -canvas.height / 2);
        }

        // Draw the cropped image
        ctx.drawImage(
            image,
            completedCrop.x * scaleX,
            completedCrop.y * scaleY,
            completedCrop.width * scaleX,
            completedCrop.height * scaleY,
            0,
            0,
            canvas.width,
            canvas.height
        );

        return new Promise((resolve) => {
            canvas.toBlob(
                (blob) => {
                    resolve(blob);
                },
                'image/jpeg',
                0.9
            );
        });
    }, [completedCrop, rotate]);

    const handleCropComplete = async () => {
        try {
            const croppedBlob = await getCroppedImg();
            if (croppedBlob) {
                const file = new File([croppedBlob], 'cropped-image.jpg', { type: 'image/jpeg' });
                onCropComplete(file, URL.createObjectURL(croppedBlob));
            }
            onClose();
        } catch (error) {
            console.error('Error cropping image:', error);
        }
    };

    const resetTransforms = () => {
        setScale(1);
        setRotate(0);
        const resetCrop = {
            unit: '%',
            width: 90,
            height: 90,
            x: 5,
            y: 5
        };
        setCrop(resetCrop);
        
        // Also reset the completed crop to ensure button is enabled
        if (imgRef.current) {
            const { width, height } = imgRef.current;
            const pixelCrop = {
                unit: 'px',
                x: (width * resetCrop.x) / 100,
                y: (height * resetCrop.y) / 100,
                width: (width * resetCrop.width) / 100,
                height: (height * resetCrop.height) / 100,
            };
            setCompletedCrop(pixelCrop);
        }
    };

    if (!imageSrc) return null;

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Crop className="h-5 w-5" />
                            Crop & Adjust Image
                        </DialogTitle>
                        <DialogDescription>
                            Adjust your image by cropping, zooming, and rotating. Use the controls below to get the perfect shot for your profile picture.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                        {/* Controls */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
                            {/* Zoom Control */}
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <ZoomIn className="h-4 w-4" />
                                    Zoom: {Math.round(scale * 100)}%
                                </Label>
                                <Slider
                                    value={[scale]}
                                    onValueChange={(value) => setScale(value[0])}
                                    min={0.5}
                                    max={3}
                                    step={0.1}
                                    className="w-full"
                                />
                            </div>

                            {/* Rotation Control */}
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <RotateCw className="h-4 w-4" />
                                    Rotation: {rotate}°
                                </Label>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setRotate(rotate - 90)}
                                    >
                                        <RotateCcw className="h-4 w-4" />
                                    </Button>
                                    <Slider
                                        value={[rotate]}
                                        onValueChange={(value) => setRotate(value[0])}
                                        min={-180}
                                        max={180}
                                        step={1}
                                        className="flex-1"
                                    />
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setRotate(rotate + 90)}
                                    >
                                        <RotateCw className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Reset Button */}
                            <div className="flex items-end">
                                <Button
                                    variant="outline"
                                    onClick={resetTransforms}
                                    className="w-full"
                                >
                                    Reset
                                </Button>
                            </div>
                        </div>

                        {/* Crop Area */}
                        <div className="relative bg-black/5 rounded-lg p-4 flex items-center justify-center min-h-[400px] max-h-[500px] overflow-auto">
                            <ReactCrop
                                crop={crop}
                                onChange={(_, percentCrop) => setCrop(percentCrop)}
                                onComplete={(c) => {
                                    console.log('Crop completed:', c);
                                    setCompletedCrop(c);
                                }}
                                aspect={aspectRatio}
                                minWidth={minWidth}
                                minHeight={minHeight}
                                className="max-w-full max-h-full"
                            >
                                <img
                                    ref={imgRef}
                                    alt="Crop preview"
                                    src={imageSrc}
                                    style={{
                                        transform: `scale(${scale}) rotate(${rotate}deg)`,
                                        transformOrigin: 'center',
                                        maxWidth: '100%',
                                        maxHeight: '100%',
                                        objectFit: 'contain'
                                    }}
                                    onLoad={onImageLoad}
                                />
                            </ReactCrop>
                        </div>

                        {/* Preview Canvas (hidden) */}
                        <canvas
                            ref={canvasRef}
                            style={{ display: 'none' }}
                        />
                    </div>

                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={onClose}>
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCropComplete}
                            disabled={!completedCrop || !completedCrop.width || !completedCrop.height}
                        >
                            <Crop className="h-4 w-4 mr-2" />
                            Apply Crop
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default ImageCropModal;