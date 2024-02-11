from js import client_message

message = json.loads(client_message, object_hook=server.lsp._deserialize_message)
server.lsp._procedure_handler(message)