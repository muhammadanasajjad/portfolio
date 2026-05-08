from livereload import Server

server = Server()
server.watch('html/*.html')
server.watch('css/*.css')
server.watch('js/*.js')

server.serve(root='.', port=8000)
