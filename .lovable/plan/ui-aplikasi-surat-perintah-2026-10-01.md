# UI Aplikasi Surat Perintah

## Hasil yang akan dibuat
- Mempertahankan halaman Login yang ada, lalu menyelaraskan tampilannya dengan area kerja utama.
- Menambahkan Dashboard setelah masuk, berisi ringkasan jumlah surat, surat terbaru, dan akses cepat membuat surat.
- Mengubah halaman Surat Perintah menjadi daftar arsip dengan pencarian serta aksi Lihat, Edit, Cetak, dan Hapus.
- Menambahkan halaman form khusus untuk membuat dan mengedit surat, termasuk pemilihan personel dari data yang tersedia.
- Menambahkan halaman Print Preview khusus yang menampilkan lembar A4 sesuai format `unit_1.doc` dan tombol cetak.

## Alur pengguna
1. Pengguna masuk melalui halaman Login.
2. Pengguna tiba di Dashboard.
3. Dari menu Surat Perintah, pengguna dapat melihat arsip atau membuat surat baru.
4. Surat tersimpan dapat dibuka, diedit, dihapus dengan konfirmasi, atau dibuka pada Print Preview.
5. Tombol cetak hanya mencetak lembar A4.

## Tampilan
- Area setelah login memakai navigasi samping yang ringkas dan konsisten untuk Dashboard serta Surat Perintah.
- Daftar surat dibuat mudah dipindai dengan status, tanggal, nomor, tugas, dan menu tindakan.
- Form dibagi menjadi kelompok informasi agar lebih mudah diisi tanpa mengubah format dokumen cetak.
- Tampilan cetak tetap mengikuti keputusan sebelumnya: kop kiri atas, Arial, ukuran A4, penomoran, garis tanda tangan, dan tembusan.

## Detail teknis
- Membuat rute terpisah untuk Dashboard, daftar Surat Perintah, form tambah/edit, detail, dan Print Preview.
- Menggunakan data `surat_perintah` dan `personel` yang sudah tersedia; tidak mengubah struktur data kecuali diperlukan untuk kelengkapan CRUD.
- Menambahkan konfirmasi hapus dan keadaan kosong/gagal/memuat yang jelas.
- Memastikan setiap halaman memiliki judul dan metadata sendiri serta tetap terlindungi oleh login.
- Memverifikasi alur utama pada tampilan desktop dan layar kecil.
