from lsprotocol.types import (TEXT_DOCUMENT_DID_CHANGE, TEXT_DOCUMENT_DID_CLOSE, TEXT_DOCUMENT_DID_OPEN, Diagnostic, DiagnosticSeverity, Position, Range)
from pygls.server import LanguageServer
from textx import metamodel_from_str, exceptions


GRAMMAR_DOC_URI = 'inmemory://model/1'
MODEL_DOC_URI = 'inmemory://model/2'


server = LanguageServer('textx-ls', '0.0.1')

@server.feature(TEXT_DOCUMENT_DID_CHANGE)
def did_change(ls, params):
    validate(ls, params)


@server.feature(TEXT_DOCUMENT_DID_OPEN)
def did_open(ls, params):
    ls.show_message_log('Document open')
    ls.show_message_log(repr(params))
    validate(ls, params) 


def validate(ls, params):
    ls.show_message_log('Validating program...')
    text_doc = ls.workspace.get_text_document(params.text_document.uri)
    grammar_diagnostics = []
    model_diagnostics = []

    docs = ls.workspace.text_documents
    ls.show_message_log(str(len(docs)))
    
    if len(docs) < 2:
        return
    
    grammar_doc = None
    model_doc = None

    if text_doc.language_id == 'textx':
        grammar_doc = text_doc
        model_doc = docs[MODEL_DOC_URI]
    else:
        grammar_doc = docs[GRAMMAR_DOC_URI]
        model_doc = text_doc

    metamodel = None
    
    ls.show_message_log('validate metamodel')
    
    try:
        metamodel = metamodel_from_str(grammar_doc.source)
    except exceptions.TextXError as err:
        grammar_diagnostics.append(Diagnostic(
            range=Range(
                start=Position(line=err.line - 1, character=err.col - 1),
                end=Position(line=err.line - 1, character=err.col)
            ),
            message=err.message,
            severity=DiagnosticSeverity.Error,
            source=type(server).__name__))
        ls.publish_diagnostics(grammar_doc.uri, grammar_diagnostics)
        ls.publish_diagnostics(model_doc.uri, model_diagnostics)
        return
    
    ls.show_message_log('validate model')

    try:        
        metamodel.model_from_str(model_doc.source)
    except exceptions.TextXError as err:
        model_diagnostics.append(Diagnostic(
            range=Range(
                start=Position(line=err.line - 1, character=err.col - 1),
                end=Position(line=err.line - 1, character=err.col)
            ),
            message=err.message,
            severity=DiagnosticSeverity.Error,
            source=type(server).__name__))
        ls.publish_diagnostics(grammar_doc.uri, grammar_diagnostics)
        ls.publish_diagnostics(model_doc.uri, model_diagnostics)


server.start_pyodide()