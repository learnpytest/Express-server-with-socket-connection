module.exports = {
  generalErrorHandler: (err) => {
    if (err instanceof Error) {
      return (socket) => {
        socket.emit('socketErrorMessage', {
          type: "error",
          message: `${err.message}`
        })
      }
    } else {

      return () => {

        socket.emit('socketErrorMessage', {
          type: "error",
          message: `${err}`
        })
      }
    }
  }

}