/**
 * Utilitário para compressão de imagens no navegador e upload para Cloudinary
 */

export interface CloudinaryUploadResult {
    success: boolean;
    url?: string;
    error?: string;
}

/**
 * Comprime uma imagem no navegador utilizando Canvas API antes do upload.
 * Reduz fotos pesadas de celulares (5MB-15MB) para ~200KB-400KB com excelente nitidez.
 */
export async function compressImage(
    file: File,
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.82
): Promise<Blob> {
    return new Promise((resolve, reject) => {
        // Se for GIF ou SVG, não comprime via Canvas para não perder animação/vetor
        if (file.type === 'image/gif' || file.type === 'image/svg+xml') {
            resolve(file);
            return;
        }

        const img = new Image();
        const reader = new FileReader();

        reader.onload = (e) => {
            img.src = e.target?.result as string;
        };

        reader.onerror = (err) => reject(err);

        img.onload = () => {
            let width = img.width;
            let height = img.height;

            // Calcular proporção mantendo o aspect ratio
            if (width > height) {
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width = Math.round((width * maxHeight) / height);
                    height = maxHeight;
                }
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                resolve(file); // fallback se canvas falhar
                return;
            }

            ctx.drawImage(img, 0, 0, width, height);

            // Converter para JPEG otimizado
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        resolve(file);
                    }
                },
                'image/jpeg',
                quality
            );
        };

        img.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
    });
}

/**
 * Faz upload de um arquivo para o Cloudinary usando Upload Preset Unsigned.
 */
export async function uploadToCloudinary(
    file: File,
    onProgress?: (percent: number) => void
): Promise<CloudinaryUploadResult> {
    try {
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

        if (!cloudName || !uploadPreset) {
            return {
                success: false,
                error: 'Configuração do Cloudinary pendente (NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ou NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET não definidos no .env).',
            };
        }

        // 1. Comprimir imagem antes do envio
        const compressedBlob = await compressImage(file);
        const uploadFile = new File([compressedBlob], file.name.replace(/\.[^/.]+$/, '.jpg'), {
            type: 'image/jpeg',
        });

        // 2. Montar FormData para o Cloudinary
        const formData = new FormData();
        formData.append('file', uploadFile);
        formData.append('upload_preset', uploadPreset);

        // 3. Executar Upload com XMLHttpRequest para acompanhar progresso
        return new Promise((resolve) => {
            const xhr = new XMLHttpRequest();
            const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

            xhr.open('POST', uploadUrl, true);

            if (xhr.upload && onProgress) {
                xhr.upload.onprogress = (event) => {
                    if (event.lengthComputable) {
                        const percent = Math.round((event.loaded / event.total) * 100);
                        onProgress(percent);
                    }
                };
            }

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const data = JSON.parse(xhr.responseText);
                        // Cloudinary retorna secure_url (HTTPS)
                        const imageUrl = data.secure_url || data.url;
                        resolve({ success: true, url: imageUrl });
                    } catch {
                        resolve({ success: false, error: 'Erro ao processar resposta do Cloudinary.' });
                    }
                } else {
                    try {
                        const errData = JSON.parse(xhr.responseText);
                        resolve({
                            success: false,
                            error: errData.error?.message || `Erro no upload (${xhr.status}).`,
                        });
                    } catch {
                        resolve({ success: false, error: `Erro no upload (Status ${xhr.status}).` });
                    }
                }
            };

            xhr.onerror = () => {
                resolve({ success: false, error: 'Falha de conexão com o servidor de fotos.' });
            };

            xhr.send(formData);
        });
    } catch (err) {
        console.error('Erro na função uploadToCloudinary:', err);
        return {
            success: false,
            error: err instanceof Error ? err.message : 'Erro desconhecido ao enviar imagem.',
        };
    }
}
