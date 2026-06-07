class StatusHelper {
  calculateStatus(durasi_awal, durasi_akhir) {
    const now = new Date();
    const startDate = new Date(durasi_awal);
    const endDate = new Date(durasi_akhir);

    if (now >= startDate && now <= endDate) {
      return 'dibuka';
    }
    return 'ditutup';
  }

  updateLowonganStatus(lowongan) {
    const status = this.calculateStatus(lowongan.durasi_awal, lowongan.durasi_akhir);
    return {
      ...lowongan,
      status_lowongan: status,
    };
  }

  updateMultipleLowonganStatus(lowonganList) {
    return lowonganList.map((lowongan) => this.updateLowonganStatus(lowongan));
  }
}

module.exports = new StatusHelper();
