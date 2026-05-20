from livereload import Server

server = Server()
server.watch('html/*.html')
server.watch('css/*.css')
server.watch('js/*.js')

server.serve(root='.', host='0.0.0.0', port=8000)
