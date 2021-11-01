
exports.increaseTime = async (web3, time) => {
    await web3.currentProvider.send({
            jsonrpc: '2.0',
            method: "evm_increaseTime",
            params: [time],
            id: 0},()=>{})
    await web3.currentProvider.send({
            jsonrpc: '2.0',
            method: "evm_mine",
            params: [],
            id: 0},()=>{})
}