/*
 * Copyright (c) 2012-2020 Sébastien Piquemal <sebpiq@gmail.com>
 *
 * BSD Simplified License.
 * For information on usage and redistribution, and for a DISCLAIMER OF ALL
 * WARRANTIES, see the file, "LICENSE.txt," in this distribution.
 *
 * See https://github.com/sebpiq/WebPd_pd-renderer for documentation
 *
 */

import defaults from 'lodash.defaults'
import isUndefined from 'lodash.isundefined'

const _nodesSort = (n1: PdJson.GenericNode, n2: PdJson.GenericNode): number =>
    parseFloat(n1.id) - parseFloat(n2.id)

export default (pd: PdJson.Pd): Pd.PdString => {
    return renderPatch(pd, pd.patches['0'], true)
}

const renderPatch = (pd: PdJson.Pd, patch: PdJson.Patch, root: boolean): Pd.PdString => {
    const renderNodeCurried = renderNode.bind(this, pd)
    let rendered: Pd.PdString = ''
    const l = defaults({}, patch.layout, {
        x: 0,
        y: 0,
        width: 500,
        height: 500,
    })
    const a = patch.args

    rendered += `#N canvas ${l.x} ${l.y} ${l.width} ${l.height} ${a[0]}${
        isUndefined(l.openOnLoad) ? '' : ' ' + (+l.openOnLoad)
    };\n`
    rendered += Object.values(patch.nodes)
        .sort(_nodesSort)
        .map(renderNodeCurried)
        .join('')
    rendered += patch.connections.map(renderConnection).join('')

    return rendered
}

const renderNode = (pd: PdJson.Pd, node: PdJson.GenericNode): Pd.PdString => {
    const l = defaults(node.layout, { x: 0, y: 0 })
    const a = node.args
    
    if (node.proto === 'pd') {
        let rendered: Pd.PdString = ''
        rendered += renderPatch(pd, pd.patches[node.refId], false)
        rendered += `#X restore ${l.x} ${l.y} pd ${a[0]};\n`
        return rendered
    }

    const renderedControl = renderControl(node as PdJson.ControlNode)
    if (renderedControl) {
        return renderedControl
    }
    
    return `#X obj ${l.x} ${l.y} ${node.proto}${
        a.length ? ' ' + a.join(' ') : ''
    };\n`
}

const renderControl = (node: PdJson.ControlNode): Pd.PdString | null => {
    const a = node.args
    if (node.proto === 'floatatom' || node.proto === 'symbolatom') {
        return `#X ${node.proto} ${node.layout.x} ${node.layout.y} ${node.layout.width} ${a[0]} ${a[1]} ${node.layout.labelPos} ${node.layout.label} ${a[2]} ${a[3]};\n`
    } else if (node.proto === 'bng') {
        return `#X obj ${node.layout.x} ${node.layout.y} bng ${node.layout.size} ${node.layout.hold} ${node.layout.interrupt} ${a[0]} ${a[1]} ${a[2]} ${node.layout.label} ${node.layout.labelX} ${node.layout.labelY} ${node.layout.labelFont} ${node.layout.labelFontSize} ${node.layout.bgColor} ${node.layout.fgColor} ${node.layout.labelColor};\n`
    } else if (node.proto === 'nbx') {
        return `#X obj ${node.layout.x} ${node.layout.y} nbx ${node.layout.size} ${node.layout.height} ${a[0]} ${a[1]} ${node.layout.log} ${a[2]} ${a[3]} ${a[4]} ${node.layout.label} ${node.layout.labelX} ${node.layout.labelY} ${node.layout.labelFont} ${node.layout.labelFontSize} ${node.layout.bgColor} ${node.layout.fgColor} ${node.layout.labelColor} ${node.layout.logHeight};\n`
    } else if (node.proto === 'vsl' || node.proto === 'hsl') {
        return `#X obj ${node.layout.x} ${node.layout.y} ${node.proto} ${node.layout.width} ${node.layout.height} ${a[0]} ${a[1]} ${node.layout.log} ${a[2]} ${a[3]} ${a[4]} ${node.layout.label} ${node.layout.labelX} ${node.layout.labelY} ${node.layout.labelFont} ${node.layout.labelFontSize} ${node.layout.bgColor} ${node.layout.fgColor} ${node.layout.labelColor} ${a[5]} ${node.layout.steadyOnClick};\n`
    } else if (node.proto === 'vradio' || node.proto === 'hradio') {
        return `#X obj ${node.layout.x} ${node.layout.y} ${node.proto} ${node.layout.size} ${a[0]} ${a[1]} ${a[2]} ${a[3]} ${a[4]} ${node.layout.label} ${node.layout.labelX} ${node.layout.labelY} ${node.layout.labelFont} ${node.layout.labelFontSize} ${node.layout.bgColor} ${node.layout.fgColor} ${node.layout.labelColor} ${a[5]};\n`
    } else if (node.proto === 'vu') {
        return `#X obj ${node.layout.x} ${node.layout.y} vu ${node.layout.width} ${node.layout.height} ${a[0]} ${node.layout.label} ${node.layout.labelX} ${node.layout.labelY} ${node.layout.labelFont} ${node.layout.labelFontSize} ${node.layout.bgColor} ${node.layout.labelColor} ${node.layout.log} ${a[1]};\n`
    } else if (node.proto === 'cnv') {
        return `#X obj ${node.layout.x} ${node.layout.y} cnv ${node.layout.size} ${node.layout.width} ${node.layout.height} ${a[0]} ${a[1]} ${node.layout.label} ${node.layout.labelX} ${node.layout.labelY} ${node.layout.labelFont} ${node.layout.labelFontSize} ${node.layout.bgColor} ${node.layout.labelColor} ${a[2]};\n`
    }
    return null
}

const renderConnection = ({ source, sink }: PdJson.Connection): Pd.PdString =>
    `#X connect ${source.id} ${source.port} ${sink.id} ${sink.port};\n`


// var floatAtomTpl =
//         '#X floatatom ${node.layout.x} ${node.layout.y} ${node.layout.width} ${a[0]} ${a[1]} ${node.layout.labelPos} ${node.layout.label} ${a[2]} ${a[3]}',
//     symbolAtomTpl =
//         '#X symbolatom ${node.layout.x} ${node.layout.y} ${node.layout.width} ${a[0]} ${a[1]} ${node.layout.labelPos} ${node.layout.label} ${a[2]} ${a[3]}',
//     bngTpl =
//         '#X obj ${node.layout.x} ${node.layout.y} bng ${node.layout.size} ${node.layout.hold} ${node.layout.interrupt} ${a[0]} ${a[1]} ${a[2]} ${node.layout.label} ${node.layout.labelX} ${node.layout.labelY} ${node.layout.labelFont} ${node.layout.labelFontSize} ${node.layout.bgColor} ${node.layout.fgColor} ${node.layout.labelColor}',
//     nbxTpl =
//         '#X obj ${node.layout.x} ${node.layout.y} nbx ${node.layout.size} ${node.layout.height} ${a[0]} ${a[1]} ${node.layout.log} ${a[2]} ${a[3]} ${a[4]} ${node.layout.label} ${node.layout.labelX} ${node.layout.labelY} ${node.layout.labelFont} ${node.layout.labelFontSize} ${node.layout.bgColor} ${node.layout.fgColor} ${node.layout.labelColor} ${node.layout.logHeight}',
//     vslTpl =
//         '#X obj ${node.layout.x} ${node.layout.y} vsl ${node.layout.width} ${node.layout.height} ${a[0]} ${a[1]} ${node.layout.log} ${a[2]} ${a[3]} ${a[4]} ${node.layout.label} ${node.layout.labelX} ${node.layout.labelY} ${node.layout.labelFont} ${node.layout.labelFontSize} ${node.layout.bgColor} ${node.layout.fgColor} ${node.layout.labelColor} ${a[5]} ${node.layout.steadyOnClick}',
//     hslTpl =
//         '#X obj ${node.layout.x} ${node.layout.y} hsl ${node.layout.width} ${node.layout.height} ${a[0]} ${a[1]} ${node.layout.log} ${a[2]} ${a[3]} ${a[4]} ${node.layout.label} ${node.layout.labelX} ${node.layout.labelY} ${node.layout.labelFont} ${node.layout.labelFontSize} ${node.layout.bgColor} ${node.layout.fgColor} ${node.layout.labelColor} ${a[5]} ${node.layout.steadyOnClick}',
//     vradioTpl =
//         '#X obj ${node.layout.x} ${node.layout.y} vradio ${node.layout.size} ${a[0]} ${a[1]} ${a[2]} ${a[3]} ${a[4]} ${node.layout.label} ${node.layout.labelX} ${node.layout.labelY} ${node.layout.labelFont} ${node.layout.labelFontSize} ${node.layout.bgColor} ${node.layout.fgColor} ${node.layout.labelColor} ${a[5]}',
//     hradioTpl =
//         '#X obj ${node.layout.x} ${node.layout.y} hradio ${node.layout.size} ${a[0]} ${a[1]} ${a[2]} ${a[3]} ${a[4]} ${node.layout.label} ${node.layout.labelX} ${node.layout.labelY} ${node.layout.labelFont} ${node.layout.labelFontSize} ${node.layout.bgColor} ${node.layout.fgColor} ${node.layout.labelColor} ${a[5]}',
//     vuTpl =
//         '#X obj ${node.layout.x} ${node.layout.y} vu ${node.layout.width} ${node.layout.height} ${a[0]} ${node.layout.label} ${node.layout.labelX} ${node.layout.labelY} ${node.layout.labelFont} ${node.layout.labelFontSize} ${node.layout.bgColor} ${node.layout.labelColor} ${node.layout.log} ${a[1]}',
//     cnvTpl =
//         '#X obj ${node.layout.x} ${node.layout.y} cnv ${node.layout.size} ${node.layout.width} ${node.layout.height} ${a[0]} ${a[1]} ${node.layout.label} ${node.layout.labelX} ${node.layout.labelY} ${node.layout.labelFont} ${node.layout.labelFontSize} ${node.layout.bgColor} ${node.layout.labelColor} ${a[2]}',
//     objTpl =
//         '#X obj ${node.layout.x} ${node.layout.y} {{{proto}}}{{#args}} {{.}}{{/args}}'
