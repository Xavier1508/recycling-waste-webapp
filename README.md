# **Trash Trade Web Application**

**Trash Trade** adalah sebuah aplikasi web ekosistem penuh yang dirancang untuk menjembatani pengguna dengan penyedia jasa pengumpul sampah (driver) secara *real-time*. Proyek ini bertujuan untuk mendigitalisasi dan menyederhanakan proses pengelolaan sampah, sambil memperkenalkan elemen gamifikasi melalui sistem poin untuk mendorong partisipasi dalam daur ulang.

Aplikasi ini dibangun menggunakan tumpukan teknologi modern, dengan **Next.js** untuk frontend dan **Node.js (Express)** untuk backend, serta komunikasi *real-time* yang difasilitasi oleh **Socket.IO**.

## **Fitur Utama**

  * **Siklus Penjemputan Lengkap:** Proses *end-to-end* mulai dari permintaan penjemputan oleh pengguna, pencarian dan penugasan driver, notifikasi *real-time*, hingga penyelesaian pesanan.
  * **Manajemen Peran Pengguna:** Sistem otentikasi dan otorisasi yang memisahkan akses dan fungsionalitas antara **pengguna umum** dan **driver**.
  * **Sistem Poin dan Hadiah:** Mekanisme gamifikasi di mana pengguna mendapatkan poin dari setiap penjemputan yang berhasil, yang kemudian dapat ditukarkan dengan hadiah dari katalog.
  * **Notifikasi Real-Time:** Pemanfaatan **WebSockets (Socket.IO)** untuk mengirim pembaruan instan kepada klien mengenai status pesanan, lokasi driver, dan perolehan poin tanpa memerlukan *refresh* manual.
  * **Sistem Umpan Balik (Feedback):** Setelah penjemputan selesai, pengguna dapat memberikan rating dan ulasan untuk driver, memastikan kualitas layanan dan membangun kepercayaan dalam platform.
  * **Antarmuka Pengguna Responsif:** Didesain dengan **Tailwind CSS**, aplikasi memberikan pengalaman pengguna yang konsisten dan optimal di berbagai ukuran perangkat.
  * **Fitur Peta Interaktif:** Integrasi dengan layanan peta untuk visualisasi dan pelacakan lokasi driver selama proses penjemputan (memerlukan konfigurasi API Key).

## **Tumpukan Teknologi**

| Kategori      | Teknologi                                                  |
| :------------ | :--------------------------------------------------------- |
| **Frontend** | `Next.js`, `React`, `Tailwind CSS`, `Framer Motion`, `Socket.IO Client` |
| **Backend** | `Node.js`, `Express.js`, `Socket.IO`, `Sequelize` (ORM)      |
| **Database** | `MySQL` (atau database lain yang didukung oleh Sequelize)   |

## **Panduan Persiapan dan Instalasi**

### **Prasyarat**

Sebelum memulai, pastikan sistem Anda telah terpasang:

  * **Node.js** (rekomendasi versi 16.x atau lebih baru)
  * **NPM** (terpasang bersama Node.js)
  * Server **Database SQL** yang aktif (contoh: XAMPP, WAMP, atau MySQL Server)

### **Proses Instalasi**

1.  **Clone Repositori:**

    ```bash
    git clone https://github.com/Xavier1508/recycling-waste-webapp.git
    cd recycling-waste-webapp
    ```

2.  **Konfigurasi Backend:**
    Backend berfungsi sebagai server utama dan pengelola logika bisnis. Buka jendela terminal pertama untuk proses ini.

    ```bash
    # Arahkan terminal ke direktori backend
    cd backend

    # Instal dependensi Node.js
    npm install
    ```

    Selanjutnya, konfigurasikan variabel lingkungan (environment variables). Buat file baru bernama `.env` di dalam direktori `backend`. Isi file tersebut dengan format berikut, sesuaikan dengan konfigurasi database Anda.

    ```env
    # Konfigurasi Database
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=
    DB_NAME=nama_database_anda

    # Kunci Rahasia untuk JSON Web Token (JWT)
    JWT_SECRET=ganti-dengan-kunci-rahasia-yang-kuat
    ```

    **Penting:** Pastikan Anda telah membuat sebuah database kosong dengan nama yang sesuai dengan nilai `DB_NAME` di atas.

3.  **Konfigurasi Frontend:**
    Frontend bertanggung jawab atas antarmuka pengguna. Buka jendela terminal kedua.

    ```bash
    # Dari direktori root proyek (recycling-waste-webapp), instal dependensi frontend
    npm install
    ```

    Aplikasi ini memerlukan **API Key dari penyedia layanan Peta** (seperti Google Maps) agar fitur pelacakan dapat berfungsi. Buat file baru bernama `.env.local` di direktori **root** proyek, lalu tambahkan variabel berikut:

    ```env
    # Ganti YOUR_API_KEY_HERE dengan API Key valid Anda
    NEXT_PUBLIC_MAPS_API_KEY=YOUR_API_KEY_HERE
    ```

    **Catatan:** Penggunaan prefiks `NEXT_PUBLIC_` pada Next.js bertujuan agar variabel ini dapat diakses dengan aman di sisi klien (browser).

## **Menjalankan Aplikasi**

Aplikasi ini memerlukan **dua proses terminal** yang berjalan secara simultan.

  * **Terminal 1 (Backend):**

    ```bash
    # Pastikan Anda berada di direktori /backend
    npm run dev
    ```

    Server backend akan aktif pada `http://localhost:3001`.

  * **Terminal 2 (Frontend):**

    ```bash
    # Pastikan Anda berada di direktori root proyek
    npm run dev
    ```

    Aplikasi frontend akan dapat diakses melalui `http://localhost:3000`.

## **Panduan Pengujian Lokal**

Untuk menguji fungsionalitas interaktif antara pengguna dan driver, diperlukan dua sesi login yang berbeda. Metode yang direkomendasikan adalah menggunakan dua mode browser yang terpisah.

1.  **Sesi Pengguna (Browser Utama):**

      * Buka browser utama Anda (misal: Chrome, Firefox).
      * Akses `http://localhost:3000`.
      * Daftarkan akun baru dan **login sebagai pengguna biasa**.

2.  **Sesi Driver (Jendela Incognito):**

      * Buka jendela baru dalam mode **Incognito** atau **Private**.
      * Akses kembali `http://localhost:3000`.
      * Daftarkan akun baru dengan email yang berbeda, lalu **login sebagai driver**.

3.  **Simulasi Alur Kerja:**

      * Pada **sesi pengguna**, lakukan permintaan penjemputan sampah.
      * Amati **sesi driver**, permintaan baru akan muncul secara *real-time* di dasbor driver.
      * Terima permintaan tersebut sebagai driver. Status pada sesi pengguna akan diperbarui secara otomatis.
      * Lanjutkan alur hingga penjemputan selesai untuk menguji sistem feedback dan perolehan poin.

## **Kontribusi**

Kontribusi untuk pengembangan proyek ini sangat terbuka. Silakan ikuti langkah-langkah standar berikut:

1.  **Fork** repositori ini.
2.  Buat **branch** fitur baru (`git checkout -b fitur/NamaFitur`).
3.  **Commit** perubahan Anda (`git commit -m 'feat: Menambahkan NamaFitur'`).
4.  **Push** ke branch tersebut (`git push origin fitur/NamaFitur`).
5.  Buka **Pull Request**.

## **Lisensi**

Proyek ini dilisensikan di bawah [Lisensi MIT](https://www.google.com/search?q=LICENSE).
