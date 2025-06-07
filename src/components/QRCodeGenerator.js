import React, { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

const QRCodeGenerator = () => {
    // All state remains the same, but add the new one for toggling
    const [showOptions, setShowOptions] = useState(false);
    const [text, setText] = useState('https://www.google.com');
    const [size, setSize] = useState(256);
    const [fgColor, setFgColor] = useState('#000000');
    const [bgColor, setBgColor] = useState('#FFFFFF');
    const [level, setLevel] = useState('M');
    const [logoImage, setLogoImage] = useState(null);
    const [qrStyle, setQrStyle] = useState('squares');
    
    // Note: Removed gradient and eye radius for ultimate simplicity.
    // They can be easily added back into the .custom-options div if needed.

    const handleDownload = () => {
        const canvas = document.getElementById('qr-code-canvas');
        if (canvas) {
            const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
            let downloadLink = document.createElement('a');
            downloadLink.href = pngUrl;
            downloadLink.download = 'qrcode.png';
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        }
    };

    const handleLogoUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => { setLogoImage(reader.result); };
            reader.readAsDataURL(file);
        } else {
            setLogoImage(null);
        }
    };

    const imageSettings = logoImage ? {
        src: logoImage,
        height: 40,
        width: 40,
        excavate: true,
    } : undefined;

    return (
        <div className="simple-container">
            <h1>QR Code Generator</h1>

            <div className="qr-preview-wrapper">
                {text ? (
                    <QRCodeCanvas
                        id="qr-code-canvas"
                        value={text}
                        size={size}
                        fgColor={fgColor}
                        bgColor={bgColor}
                        level={level}
                        imageSettings={imageSettings}
                        qrStyle={qrStyle}
                    />
                ) : (
                    <p style={{ color: '#888' }}>Enter text to see QR code</p>
                )}
            </div>

            <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="main-input"
                placeholder="Enter URL or text here"
            />

            <button onClick={handleDownload} className="primary-btn">
                Download QR Code
            </button>

            <hr className="options-divider" />
            
            <button onClick={() => setShowOptions(!showOptions)} className="secondary-btn">
                {showOptions ? 'Hide Customization' : 'Show Customization'}
            </button>

            {showOptions && (
                <div className="custom-options">
                    <div className="option-group">
                        <label>Size (px)</label>
                        <input type="number" value={size} onChange={(e) => setSize(parseInt(e.target.value, 10))} />
                    </div>

                    <div className="color-picker-group">
                        <div className="option-group">
                            <label>Foreground</label>
                            <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} />
                        </div>
                        <div className="option-group">
                            <label>Background</label>
                            <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} />
                        </div>
                    </div>

                    <div className="option-group">
                        <label>Style</label>
                        <select value={qrStyle} onChange={(e) => setQrStyle(e.target.value)}>
                            <option value="squares">Squares</option>
                            <option value="dots">Dots</option>
                        </select>
                    </div>

                    <div className="option-group">
                        <label>Error Correction</label>
                        <select value={level} onChange={(e) => setLevel(e.target.value)}>
                            <option value="L">Low</option>
                            <option value="M">Medium</option>
                            <option value="Q">Quartile</option>
                            <option value="H">High</option>
                        </select>
                    </div>

                    <div className="option-group">
                        <label>Logo</label>
                        <input type="file" accept="image/*" onChange={handleLogoUpload} />
                        {logoImage && (
                            <button onClick={() => setLogoImage(null)} style={{ all: 'unset', color: 'var(--accent-color)', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.9em', marginTop: '4px' }}>
                                Remove Logo
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default QRCodeGenerator;
