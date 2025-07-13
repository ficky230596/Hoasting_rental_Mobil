document.addEventListener('DOMContentLoaded', function () {
    // Batasi input nomor telepon hanya ke angka
    const editPhone = document.getElementById('editPhone');
    if (editPhone) {
        editPhone.addEventListener('input', function () {
            this.value = this.value.replace(/[^0-9]/g, ''); // Hanya izinkan angka
        });
    } else {
        console.error('editPhone input not found.');
    }

    // Pratinjau gambar profil baru
    const editProfileImage = document.getElementById('editProfileImage');
    const profileImagePreview = document.getElementById('profileImagePreview');
    if (editProfileImage && profileImagePreview) {
        editProfileImage.addEventListener('change', function () {
            const file = this.files[0];
            profileImagePreview.style.display = 'none';
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    profileImagePreview.src = e.target.result;
                    profileImagePreview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'File profil harus berupa gambar (jpg, png, dll).'
                });
            }
        });
    } else {
        console.error('editProfileImage or profileImagePreview not found.');
    }

    // Pratinjau gambar SIM baru
    const editSimImage = document.getElementById('editSimImage');
    const simImagePreview = document.getElementById('simImagePreview');
    if (editSimImage && simImagePreview) {
        editSimImage.addEventListener('change', function () {
            const file = this.files[0];
            simImagePreview.style.display = 'none';
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    simImagePreview.src = e.target.result;
                    simImagePreview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'File SIM harus berupa gambar (jpg, png, dll).'
                });
            }
        });
    } else {
        console.error('editSimImage or simImagePreview not found.');
    }

    // Event listener untuk tombol Save Changes
    const saveChanges = document.getElementById('saveChanges');
    if (saveChanges) {
        saveChanges.addEventListener('click', function () {
            saveChanges.disabled = true; // Cegah klik ganda
            document.getElementById('loadingSpinner').style.display = 'flex';

            // Validasi file SIM
            const simFile = document.getElementById('editSimImage').files[0];
            if (simFile && !simFile.type.startsWith('image/')) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'File SIM harus berupa gambar (jpg, png, dll).'
                });
                saveChanges.disabled = false;
                document.getElementById('loadingSpinner').style.display = 'none';
                return;
            }

            // Validasi file profil
            const profileFile = document.getElementById('editProfileImage').files[0];
            if (profileFile && !profileFile.type.startsWith('image/')) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'File profil harus berupa gambar (jpg, png, dll).'
                });
                saveChanges.disabled = false;
                document.getElementById('loadingSpinner').style.display = 'none';
                return;
            }

            // Validasi nomor telepon
            const phone = document.getElementById('editPhone').value;
            if (!phone) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Nomor telepon tidak boleh kosong.'
                });
                saveChanges.disabled = false;
                document.getElementById('loadingSpinner').style.display = 'none';
                return;
            }

            // Validasi format nomor telepon
            const phoneRegex = /^(0|\+62)\d{9,12}$/;
            if (!phoneRegex.test(phone)) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Nomor telepon tidak valid. Harus dimulai dengan 0 atau +62 dan memiliki 10-13 digit.'
                });
                saveChanges.disabled = false;
                document.getElementById('loadingSpinner').style.display = 'none';
                return;
            }

            // Sanitasi nomor telepon: hanya kirim nomor mentah, biarkan backend menangani +62
            let cleanedPhone = phone.replace(/[^0-9]/g, '');
            if (cleanedPhone.startsWith('0')) {
                cleanedPhone = cleanedPhone; // Biarkan nomor dimulai dengan 0
            } else if (cleanedPhone.startsWith('62')) {
                cleanedPhone = '0' + cleanedPhone.slice(2); // Ubah 62 menjadi 0
            }
            console.log('Nomor telepon sebelum dikirim:', cleanedPhone);

            // Mengumpulkan data dari form
            const formData = new FormData();
            formData.append('username', document.getElementById('editName').value);
            formData.append('email', document.getElementById('editEmail').value);
            formData.append('phone', cleanedPhone);
            formData.append('address', document.getElementById('editAddress').value);
            formData.append('name', document.getElementById('editFullName').value);
            if (profileFile) formData.append('profile_image', profileFile);
            if (simFile) formData.append('image', simFile);

            // Mengirimkan permintaan ke server
            fetch('/profile', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.result === 'success') {
                        // Memperbarui UI dengan data baru
                        document.getElementById('email').innerText = document.getElementById('editEmail').value;
                        document.getElementById('phone').innerText = cleanedPhone;
                        document.getElementById('address').innerText = document.getElementById('editAddress').value;
                        document.getElementById('name').innerText = document.getElementById('editFullName').value;

                        // Memperbarui gambar SIM jika ada file baru
                        if (simFile) {
                            const reader = new FileReader();
                            reader.onload = function (e) {
                                document.getElementById('ktpSimImage').src = e.target.result;
                            };
                            reader.readAsDataURL(simFile);
                        }

                        // Memperbarui gambar profil jika ada file baru
                        if (profileFile) {
                            const reader = new FileReader();
                            reader.onload = function (e) {
                                document.getElementById('profileImage').src = e.target.result;
                            };
                            reader.readAsDataURL(profileFile);
                        }

                        // Menutup modal dan menampilkan pesan sukses
                        $('#editModal').modal('hide');
                        Swal.fire({
                            icon: 'success',
                            title: 'Berhasil',
                            text: 'Profil berhasil diperbarui!'
                        });
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: data.msg
                        });
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Terjadi kesalahan saat memperbarui profil. Silakan coba lagi nanti.'
                    });
                })
                .finally(() => {
                    document.getElementById('loadingSpinner').style.display = 'none';
                    saveChanges.disabled = false;
                });
        });
    } else {
        console.error('saveChanges button not found.');
    }
});

function showImage() {
    const simImage = document.getElementById('ktpSimImage');
    if (simImage && simImage.src) {
        Swal.fire({
            title: 'Foto SIM',
            imageUrl: simImage.src,
            imageAlt: 'Foto SIM',
            imageWidth: '100%',
            imageHeight: 'auto',
            showCloseButton: true,
            showConfirmButton: false
        });
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Foto SIM tidak ditemukan!'
        });
    }
}