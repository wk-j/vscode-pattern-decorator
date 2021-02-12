import * as vscode from 'vscode';

type DecoratorConfig = {
    pattern: string
    before: string
    after: string
}

function patternDecorationType(before, after) {
    return vscode.window.createTextEditorDecorationType({
        after: {
            contentText: after,
            color: "dimgray",
            fontWeight: "100"
            // textDecoration: "none; font-size: 15px"
        },
        before: {
            contentText: before,
            color: "dimgray",
            fontWeight: "100"
            // textDecoration: "none; font-size: 15px"
        },
        // cursor: 'crosshair',
        isWholeLine: false,
        color: "orange"
        // use a themable color. See package.json for the declaration and default values.
        // backgroundColor: { id: 'myextension.largeNumberBackground' }
    });
}

// this method is called when vs code is activated
export function activate(context: vscode.ExtensionContext) {
    console.log('Patter decorator is activated');

    // let timeout: NodeJS.Timer | undefined = undefined;

    let activeEditor = vscode.window.activeTextEditor;
    let config = vscode.workspace.getConfiguration("patternDecorator").get<DecoratorConfig[]>("decorators")
    let types = config.map(x => {
        return {
            key: x.pattern,
            type: patternDecorationType(x.before, x.after)
        }
    })

    function updateDecorator(regex) {
        const text = activeEditor.document.getText();
        const decorators: vscode.DecorationOptions[] = [];
        let match;
        while ((match = regex.exec(text))) {
            const startPos = activeEditor.document.positionAt(match.index);
            const endPos = activeEditor.document.positionAt(match.index + match[0].length);
            const decoration = {
                range: new vscode.Range(startPos, endPos),
                // hoverMessage: 'Number **' + match[0] + '**'
            };
            decorators.push(decoration);
        }
        return decorators
    }

    function updateDecorations() {
        if (!activeEditor) {
            return;
        }

        if (config) {
            let all: { key: string, options: vscode.DecorationOptions[] }[] = []
            for (var item of config) {
                var pattern = item.pattern
                var regex = new RegExp(pattern, "g")
                var options = updateDecorator(regex)
                all.push({ key: pattern, options: options })
            }

            for (var info of all) {
                var type = types.find(x => x.key == info.key).type
                activeEditor.setDecorations(type, info.options);
            }
        }
    }

    // function triggerUpdateDecorations() {
    //     var file = vscode.window.activeTextEditor.document.fileName;
    //     if (timeout) {
    //         clearTimeout(timeout);
    //         timeout = undefined;
    //     }
    //     timeout = setTimeout(updateDecorations, 2000);
    // }

    // if (activeEditor) {
    //     triggerUpdateDecorations();
    // }

    vscode.workspace.onDidChangeConfiguration(() => {
        // config = vscode.workspace.getConfiguration("patternDecorator").get<DecoratorConfig[]>("decorators")
        // types = config.map(x => {
        //     return {
        //         key: x.pattern,
        //         type: patternDecorationType(x.before, x.after)
        //     }
        // })
    })

    vscode.workspace.onDidOpenTextDocument(editor => {
        updateDecorations();
    })

    vscode.window.onDidChangeActiveTextEditor(editor => {
        activeEditor = editor;
        if (editor) {
            updateDecorations();
        }
    }, null, context.subscriptions);

    vscode.workspace.onDidChangeTextDocument(event => {
        if (activeEditor && event.document === activeEditor.document) {
            updateDecorations();
        }
    }, null, context.subscriptions);
}