import { config } from './config.js';

document.addEventListener('DOMContentLoaded', () => {
    const colorPicker = document.getElementById('colorPicker');
    const colorValue = document.getElementById('colorValue');
    const harmonyType = document.getElementById('harmonyType');
    const generateBtn = document.getElementById('generateBtn');
    const paletteContainer = document.getElementById('paletteContainer');

    // Update color value when picking a color
    colorPicker.addEventListener('input', () => {
        colorValue.textContent = colorPicker.value;
    });

    // Generate palette when button is clicked
    generateBtn.addEventListener('click', generateColorPalette);

    // Initial palette generation
    generateColorPalette();

    async function generateColorPalette() {
        const color = colorPicker.value.replace('#', '');
        const harmony = harmonyType.value;
        
        try {
            const response = await fetch(`/api/color_palette?color=${color}&type=${harmony}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch color palette');
            }
            
            const data = await response.json();
            renderColorPalette(data);
        } catch (error) {
            console.error('Error:', error);
            paletteContainer.innerHTML = `
                <div class="error-message">
                    Failed to generate color palette. Please try again.
                </div>
            `;
        }
    }

    function renderColorPalette(colors) {
        paletteContainer.innerHTML = '';
        
        colors.forEach(color => {
            const swatch = document.createElement('div');
            swatch.className = 'color-swatch';
            
            // Calculate text color based on background lightness
            const textColor = isLightColor(color.hex) ? '#333' : '#fff';
            
            swatch.innerHTML = `
                <div class="color-display" style="background-color: ${color.hex}">
                    <span style="color: ${textColor}"></span>
                </div>
                <div class="color-info">
                    <div class="color-hex">${color.hex}</div>
                    <div class="color-name">${color.name}</div>
                    <button class="copy-button" data-color="${color.hex}">Copy</button>
                </div>
            `;
            
            paletteContainer.appendChild(swatch);
        });
        
        // Add event listeners to copy buttons
        document.querySelectorAll('.copy-button').forEach(button => {
            button.addEventListener('click', () => {
                const colorValue = button.getAttribute('data-color');
                copyToClipboard(colorValue);
                showCopiedMessage(colorValue);
            });
        });
    }

    function isLightColor(hexColor) {
        // Convert hex to RGB
        const r = parseInt(hexColor.substr(1, 2), 16);
        const g = parseInt(hexColor.substr(3, 2), 16);
        const b = parseInt(hexColor.substr(5, 2), 16);
        
        // Calculate perceived brightness using YIQ formula
        const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        return yiq >= 128;
    }

    function copyToClipboard(text) {
        navigator.clipboard.writeText(text)
            .catch(err => console.error('Failed to copy text: ', err));
    }

    function showCopiedMessage(colorValue) {
        // Remove existing message if any
        const existingMessage = document.querySelector('.copied-message');
        if (existingMessage) {
            document.body.removeChild(existingMessage);
        }
        
        // Create and show new message
        const message = document.createElement('div');
        message.className = 'copied-message';
        message.textContent = `Copied ${colorValue} to clipboard`;
        document.body.appendChild(message);
        
        // Show with a small delay for animation
        setTimeout(() => message.classList.add('show'), 10);
        
        // Hide and remove after 2 seconds
        setTimeout(() => {
            message.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(message)) {
                    document.body.removeChild(message);
                }
            }, 300);
        }, 2000);
    }
});

