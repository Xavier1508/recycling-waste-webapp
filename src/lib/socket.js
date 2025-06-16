import { io } from 'socket.io-client';

// URL backend Anda
const URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

// Buat satu instance socket dan ekspor
// Opsi 'autoConnect: false' berarti socket tidak akan langsung terhubung saat diimpor
export const socket = io(URL, {
    autoConnect: false
});