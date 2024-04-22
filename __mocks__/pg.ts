class PoolMock {
  async query() {
    return { rows: [], rowCount: 0 };
  }
}

export { PoolMock as Pool };
