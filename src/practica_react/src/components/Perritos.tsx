import { useEffect, useState } from 'react';
import Spinner from './Spinner';

export function Perritos() {
    const [dogImage, setDogImage] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchDog = async () => {
        setLoading(true);
        try {
            const response = await fetch('https://dog.ceo/api/breeds/image/random');
            const data = await response.json();
            if (data.status === 'success') {
                setDogImage(data.message);
            }
        } catch (error) {
            console.error('Error fetching dog image:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDog();
    }, []);

    return (
        <div className="flex flex-col items-center gap-4 mt-6">
            {loading ? (
                <Spinner />
            ) : dogImage ? (
                <img
                    src={dogImage}
                    alt="Un perrito aleatorio"
                    className="w-64 h-64 object-cover rounded-lg shadow-lg"
                />
            ) : (
                <p>No se pudo cargar la imagen.</p>
            )}
            <button
                onClick={fetchDog}
                className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-md shadow hover:bg-blue-600 transition-colors"
            >
                ¡Otro perrito!
            </button>
        </div>
    );
}
