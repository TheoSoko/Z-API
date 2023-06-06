//import http from "http";


//const server = http.createServer(async (req, res) => {
//   if (req.url === "/") {
      //const fetchedFromServer = new Promise((resolve, fail) => {

        fetch('http://162.19.92.192')
            .then(async (res) => {
                console.log('hey, it seems to work, here is the response')
                console.log("status : ", res.status)
                const body = await res.text()
                console.log(body)
                //resolve(res)
            })
            .catch((err) => {
                console.log('Error here :')
                console.table(err)
                console.log(err)
                //fail(err)
            })


      //})
      //await fetchedFromServer
      //res.write('' + await fetchedFromServer.catch(err => err))
      //res.end()
//   }
//})


// server listen port
//server.listen(8080, '127.0.0.1',() => console.log('*** listening now ***'))