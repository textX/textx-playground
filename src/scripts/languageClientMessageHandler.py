from js import language_client_message

message = json.loads(language_client_message, object_hook=server.lsp._deserialize_message)
server.lsp._procedure_handler(message)