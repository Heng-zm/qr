import React, { useState, useRef, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

const QRCodeGenerator = () => {
    const [text, setText] = useState('https://reactjs.org');
    const [size, setSize] = useState(256);
    const [fgColor, setFgColor] = useState('#000000');
    const [bgColor, setBgColor] = useState('#FFFFFF');
    const [level, setLevel] = useState('M');
    const [includeMargin, setIncludeMargin] = useState(false);

    const [logoImage, setLogoImage] = useState(null);
    const [logoWidth, setLogoWidth] = useState(60);
    const [logoHeight, setLogoHeight] = useState(60);
    const [removeQrCodeBehindLogo, setRemoveQrCodeBehindLogo] = useState(true);

    const [eyeRadius, setEyeRadius] = useState('0'); // Store as string for input
    const [qrStyle, setQrStyle] = useState('squares');

    const [enableGradientFg, setEnableGradientFg] = useState(false);
    const [gradientFgStart, setGradientFgStart] = useState('#FF0000');
    const [gradientFgEnd, setGradientFgEnd] = useState('#0000FF');
    const [gradientFgDirection, setGradientFgDirection] = useState('vertical');

    const qrCanvasComponentRef = useRef(null); // Ref for QRCodeCanvas component (not used directly for gradient)

    const applyGradientToCanvas = () => {
        if (!enableGradientFg) return;

        const canvasElement = document.getElementById('qr-code-canvas');
        if (!canvasElement) {
            console.error("Canvas element not found for gradient application.");
            return;
        }

        const ctx = canvasElement.getContext('2d');
        if (!ctx) return;

        let grad;
        const canvasWidth = canvasElement.width;
        const canvasHeight = canvasElement.height;

        switch (gradientFgDirection) {
            case 'horizontal':
                grad = ctx.createLinearGradient(0, 0, canvasWidth, 0);
                break;
            case 'diagonal-tl-br':
                grad = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
                break;
            case 'diagonal-tr-bl':
                grad = ctx.createLinearGradient(canvasWidth, 0, 0, canvasHeight);
                break;
            case 'vertical':
            default:
                grad = ctx.createLinearGradient(0, 0, 0, canvasHeight);
                break;
        }

        grad.addColorStop(0, gradientFgStart);
        grad.addColorStop(1, gradientFgEnd);

        ctx.globalCompositeOperation = 'source-in';
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        ctx.globalCompositeOperation = 'source-over';
    };

    useEffect(() => {
        // This effect runs after QRCodeCanvas has rendered/updated.
        // It relies on the canvas element being available in the DOM.
        // The timeout helps ensure the canvas is fully rendered by qrcode.react
        // before we try to draw on it, especially after prop changes.
        const timer = setTimeout(() => {
            applyGradientToCanvas();
        }, 50); // Small delay to ensure canvas is ready

        return () => clearTimeout(timer); // Cleanup timer

    }, [
        text, size, bgColor, level, includeMargin, logoImage, logoWidth, logoHeight,
        removeQrCodeBehindLogo, eyeRadius, qrStyle, fgColor,
        enableGradientFg, gradientFgStart, gradientFgEnd, gradientFgDirection
    ]);


    const handleLogoUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoImage(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setLogoImage(null);
        }
    };

    const handleDownload = () => {
        // Ensure gradient is applied for download. The useEffect should handle this,
        // but calling it directly before download ensures it for cases where
        // the canvas might not have re-rendered via useEffect yet.
        // A better approach might be to use a callback from QRCodeCanvas if available,
        // or ensure the state update triggering re-render completes first.
        // For simplicity, direct call here, though usually useEffect is sufficient.
        if (enableGradientFg) {
            applyGradientToCanvas(); // Ensure gradient is on the canvas for download
        }

        const canvas = document.getElementById('qr-code-canvas');
        if (canvas) {
            const pngUrl = canvas
                .toDataURL('image/png')
                .replace('image/png', 'image/octet-stream');
            let downloadLink = document.createElement('a');
            downloadLink.href = pngUrl;
            downloadLink.download = `qr-code-${text.substring(0,15).replace(/[^a-zA-Z0-9]/g, '_') || 'custom'}.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        } else {
            console.error("Could not find QR Code canvas element for download.");
        }
    };

    const imageSettings = logoImage ? {
        src: logoImage,
        height: parseInt(logoHeight, 10),
        width: parseInt(logoWidth, 10),
        excavate: removeQrCodeBehindLogo,
    } : undefined;

    const parseEyeRadiusFromString = (valueStr) => {
        if (typeof valueStr !== 'string') valueStr = String(valueStr); // Ensure it's a string

        if (valueStr.includes(',')) {
            return valueStr.split(',').map(r => {
                const num = parseInt(r.trim(), 10);
                return isNaN(num) ? 0 : num;
            });
        }
        const singleVal = parseInt(valueStr.trim(), 10);
        const validSingleVal = isNaN(singleVal) ? 0 : singleVal;
        return [validSingleVal, validSingleVal, validSingleVal, validSingleVal];
    };
    
    const currentQrFgColor = enableGradientFg ? '#000001' : fgColor; // Base color for QR lib

    return (
        <div className="qr-generator-container">
            <div className="controls">
                <h2>Customize QR Code</h2>

                <div className="control-group">
                    <label htmlFor="text">Data (URL, Text, etc.):</label>
                    <input type="text" id="text" value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g., https://example.com" />
                </div>

                <div className="control-group">
                    <label htmlFor="size">Size (px):</label>
                    <input type="number" id="size" value={size} min="50" max="1000" step="8" onChange={(e) => setSize(parseInt(e.target.value, 10))} />
                </div>

                <div className="control-group">
                    <label
                        htmlFor="fgColor"
                        className={enableGradientFg ? 'label-disabled' : ''}
                    >
                        Solid Foreground Color {enableGradientFg && "(Overridden by Gradient)"}:
                    </label>
                    <input
                        type="color"
                        id="fgColor"
                        value={fgColor}
                        onChange={(e) => setFgColor(e.target.value)}
                        disabled={enableGradientFg}
                    />
                </div>

                <div className="control-group">
                    <label htmlFor="bgColor">Background Color:</label>
                    <input type="color" id="bgColor" value={bgColor} onChange={(e) => setBgColor(e.target.value)} />
                </div>

                {/* --- Gradient Foreground Controls --- */}
                <hr />
                <div className="control-group">
                    <label className="checkbox-label" htmlFor="enableGradientFg">
                        <input
                            type="checkbox"
                            id="enableGradientFg"
                            checked={enableGradientFg}
                            onChange={(e) => setEnableGradientFg(e.target.checked)}
                        />
                        <span>Enable Gradient Foreground</span>
                    </label>
                </div>

                {enableGradientFg && (
                    <fieldset className="gradient-controls-fieldset">
                        <legend>Gradient Options</legend>
                        <div className="gradient-options-grid">
                            <div className="control-group">
                                <label htmlFor="gradientFgStart">Start Color:</label>
                                <input type="color" id="gradientFgStart" value={gradientFgStart} onChange={(e) => setGradientFgStart(e.target.value)} />
                            </div>
                            <div className="control-group">
                                <label htmlFor="gradientFgEnd">End Color:</label>
                                <input type="color" id="gradientFgEnd" value={gradientFgEnd} onChange={(e) => setGradientFgEnd(e.target.value)} />
                            </div>
                        </div>
                        <div className="control-group">
                            <label htmlFor="gradientFgDirection">Direction:</label>
                            <select id="gradientFgDirection" value={gradientFgDirection} onChange={(e) => setGradientFgDirection(e.target.value)}>
                                <option value="vertical">Vertical (Top to Bottom)</option>
                                <option value="horizontal">Horizontal (Left to Right)</option>
                                <option value="diagonal-tl-br">Diagonal (Top-Left to Bottom-Right)</option>
                                <option value="diagonal-tr-bl">Diagonal (Top-Right to Bottom-Left)</option>
                            </select>
                        </div>
                    </fieldset>
                )}
                <hr />

                <div className="control-group">
                    <label htmlFor="level">Error Correction Level:</label>
                    <select id="level" value={level} onChange={(e) => setLevel(e.target.value)}>
                        <option value="L">Low (L ~7% correction)</option>
                        <option value="M">Medium (M ~15% correction)</option>
                        <option value="Q">Quartile (Q ~25% correction)</option>
                        <option value="H">High (H ~30% correction)</option>
                    </select>
                </div>

                <div className="control-group">
                    <label htmlFor="qrStyle">Module Style:</label>
                    <select id="qrStyle" value={qrStyle} onChange={(e) => setQrStyle(e.target.value)}>
                        <option value="squares">Squares</option>
                        <option value="dots">Dots</option>
                    </select>
                </div>
                
                <div className="control-group">
                     <label className="checkbox-label" htmlFor="includeMargin">
                        <input
                            type="checkbox"
                            id="includeMargin"
                            checked={includeMargin}
                            onChange={(e) => setIncludeMargin(e.target.checked)}
                        />
                        <span>Include Margin (Quiet Zone)</span>
                    </label>
                </div>

                <div className="control-group">
                    <label htmlFor="eyeRadiusInput">Eye Radius (Corner Shape):</label>
                    <input
                        type="text"
                        id="eyeRadiusInput"
                        placeholder="e.g., 10 or 10,0,10,0"
                        value={eyeRadius} // Bind directly to string state
                        onChange={(e) => setEyeRadius(e.target.value)}
                    />
                    <small>Single value for all corners, or TL,TR,BL,BR. Max half of eye module size.</small>
                </div>

                <hr />
                <h3>Logo Customization</h3>
                <div className="control-group">
                    <label htmlFor="logo">Logo Image (Optional):</label>
                    <input type="file" id="logo" accept="image/png, image/jpeg, image/svg+xml" onChange={handleLogoUpload} />
                    {logoImage && <button onClick={() => { setLogoImage(null); document.getElementById('logo').value = null; }} className="remove-logo-btn">Remove Logo</button>}
                </div>

                {logoImage && (
                    <>
                        <div className="control-group">
                            <label htmlFor="logoWidth">Logo Width (px):</label>
                            <input type="number" id="logoWidth" value={logoWidth} min="10" max="200" onChange={(e) => setLogoWidth(parseInt(e.target.value, 10))} />
                        </div>
                        <div className="control-group">
                            <label htmlFor="logoHeight">Logo Height (px):</label>
                            <input type="number" id="logoHeight" value={logoHeight} min="10" max="200" onChange={(e) => setLogoHeight(parseInt(e.target.value, 10))} />
                        </div>
                        <div className="control-group">
                            <label className="checkbox-label" htmlFor="removeQrCodeBehindLogo">
                                <input
                                    type="checkbox"
                                    id="removeQrCodeBehindLogo"
                                    checked={removeQrCodeBehindLogo}
                                    onChange={(e) => setRemoveQrCodeBehindLogo(e.target.checked)}
                                />
                                <span>Clear Space Behind Logo (Excavate)</span>
                            </label>
                        </div>
                    </>
                )}
                <br/>
                <button onClick={handleDownload} className="download-btn">Download QR Code (PNG)</button>
            </div>

            <div className="qr-preview">
                <h3>Preview</h3>
                {text ? (
                    <QRCodeCanvas
                        id="qr-code-canvas"
                        value={text}
                        size={size}
                        fgColor={currentQrFgColor}
                        bgColor={bgColor}
                        level={level}
                        includeMargin={includeMargin}
                        imageSettings={imageSettings}
                        eyeRadius={parseEyeRadiusFromString(eyeRadius)}
                        qrStyle={qrStyle}
                        ref={qrCanvasComponentRef} 
                    />
                ) : (
                    <p>Enter data to generate a QR code.</p>
                )}
                 <p className="notes">
                    Note: High error correction (H or Q) is recommended when using a logo or complex styling.
                    Ensure the logo doesn't obscure too much of the QR code (max 25-30% area).
                </p>
            </div>
        </div>
    );
};

export default QRCodeGenerator;