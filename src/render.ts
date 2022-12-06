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

import { PdJson } from '@webpd/pd-json'
import defaults from 'lodash.defaults'
import isUndefined from 'lodash.isundefined'

export default (pd: PdJson.Pd, patchId: PdJson.ObjectGlobalId): PdJson.PdString => {
    return renderPatch(pd, pd.patches[patchId], true)
}

const renderPatch = (
    pd: PdJson.Pd,
    patch: PdJson.Patch,
    root: boolean
): PdJson.PdString => {
    let rendered: PdJson.PdString = ''
    const l = defaults({}, patch.layout, {
        x: 0,
        y: 0,
        width: 500,
        height: 500,
    })
    const a = patch.args
    const name = a[0] || '10'
    const openOnLoad = isUndefined(l.openOnLoad) ? '' : ' ' + bToN(l.openOnLoad)

    rendered += `#N canvas ${l.x} ${l.y} ${l.width} ${l.height} ${name}${openOnLoad};\n`

    // In .pd file node ids correspond to the position of appearance of the node in the file.
    // Therefore, to allow rendering connections, we need reassign new ids to nodes
    const nodeIdMap: {
        [oldId: PdJson.ObjectLocalId]: PdJson.ObjectLocalId
    } = {}
    rendered += Object.values(patch.nodes)
        .map((node, i) => {
            const newNodeId = i.toString(10)
            nodeIdMap[node.id] = newNodeId
            return renderNode(pd, node)
        })
        .join('')

    rendered += patch.connections
        .map((connection) => {
            const { source, sink } = connection
            return renderConnection({
                source: { ...source, nodeId: nodeIdMap[source.nodeId] },
                sink: { ...sink, nodeId: nodeIdMap[sink.nodeId] },
            })
        })
        .join('')

    return rendered
}

const renderNode = (pd: PdJson.Pd, node: PdJson.GenericNode): PdJson.PdString => {
    const l = defaults(node.layout, { x: 0, y: 0 })
    const a = node.args

    if (node.type === 'pd') {
        let rendered: PdJson.PdString = ''
        rendered += renderPatch(pd, pd.patches[node.refId], false)
        rendered += `#X restore ${l.x} ${l.y} pd ${a[0]};\n`
        return rendered
    }

    const renderedControl = renderControlNode(node.type, a, l)
    if (renderedControl) {
        return renderedControl
    } else {
        return renderGenericNode(node.type, a, l)
    }
}

const renderControlNode = (
    nodeType: PdJson.ObjectType,
    a: PdJson.ObjectArgs,
    l: PdJson.ControlNode['layout']
): PdJson.PdString | null => {
    if (isAtomLayout(nodeType, l)) {
        return `#X ${nodeType} ${l.x} ${l.y} ${l.width} ${a[0]} ${a[1]} ${l.labelPos} ${l.label} ${a[2]} ${a[3]};\n`
    } else if (isBangLayout(nodeType, l)) {
        return `#X obj ${l.x} ${l.y} bng ${l.size} ${l.hold} ${l.interrupt} ${a[0]} ${a[1]} ${a[2]} ${l.label} ${l.labelX} ${l.labelY} ${l.labelFont} ${l.labelFontSize} ${l.bgColor} ${l.fgColor} ${l.labelColor};\n`
    } else if (isNumberBoxLayout(nodeType, l)) {
        return `#X obj ${l.x} ${l.y} nbx ${l.size} ${l.height} ${a[0]} ${a[1]} ${l.log} ${a[2]} ${a[3]} ${a[4]} ${l.label} ${l.labelX} ${l.labelY} ${l.labelFont} ${l.labelFontSize} ${l.bgColor} ${l.fgColor} ${l.labelColor} ${l.logHeight};\n`
    } else if (isSliderLayout(nodeType, l)) {
        return `#X obj ${l.x} ${l.y} ${nodeType} ${l.width} ${l.height} ${a[0]} ${a[1]} ${l.log} ${a[2]} ${a[3]} ${a[4]} ${l.label} ${l.labelX} ${l.labelY} ${l.labelFont} ${l.labelFontSize} ${l.bgColor} ${l.fgColor} ${l.labelColor} ${a[5]} ${l.steadyOnClick};\n`
    } else if (isRadioLayout(nodeType, l)) {
        return `#X obj ${l.x} ${l.y} ${nodeType} ${l.size} ${a[0]} ${a[1]} ${a[2]} ${a[3]} ${a[4]} ${l.label} ${l.labelX} ${l.labelY} ${l.labelFont} ${l.labelFontSize} ${l.bgColor} ${l.fgColor} ${l.labelColor} ${a[5]};\n`
    } else if (isVuLayout(nodeType, l)) {
        return `#X obj ${l.x} ${l.y} vu ${l.width} ${l.height} ${a[0]} ${l.label} ${l.labelX} ${l.labelY} ${l.labelFont} ${l.labelFontSize} ${l.bgColor} ${l.labelColor} ${l.log} ${a[1]};\n`
    } else if (isCnvLayout(nodeType, l)) {
        return `#X obj ${l.x} ${l.y} cnv ${l.size} ${l.width} ${l.height} ${a[0]} ${a[1]} ${l.label} ${l.labelX} ${l.labelY} ${l.labelFont} ${l.labelFontSize} ${l.bgColor} ${l.labelColor} ${a[2]};\n`
    }
    return null
}

const renderGenericNode = (
    nodeType: PdJson.ObjectType,
    a: PdJson.ObjectArgs,
    l: PdJson.ObjectLayout
): PdJson.PdString =>
    `#X obj ${l.x} ${l.y} ${nodeType}${a.length ? ' ' + a.join(' ') : ''};\n`

const renderConnection = ({ source, sink }: PdJson.Connection): PdJson.PdString =>
    `#X connect ${source.nodeId} ${source.portletId} ${sink.nodeId} ${sink.portletId};\n`

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
//         '#X obj ${node.layout.x} ${node.layout.y} {{{type}}}{{#args}} {{.}}{{/args}}'

const bToN = (bool: boolean) => +bool

const isAtomLayout = (
    nodeType: PdJson.ObjectType,
    layout: PdJson.ControlNode['layout']
): layout is PdJson.AtomLayout =>
    nodeType === 'floatatom' || nodeType === 'symbolatom'

const isBangLayout = (
    nodeType: PdJson.ObjectType,
    layout: PdJson.ControlNode['layout']
): layout is PdJson.BangLayout => nodeType === 'bng'

const isNumberBoxLayout = (
    nodeType: PdJson.ObjectType,
    layout: PdJson.ControlNode['layout']
): layout is PdJson.NumberBoxLayout => nodeType === 'nbx'

const isSliderLayout = (
    nodeType: PdJson.ObjectType,
    layout: PdJson.ControlNode['layout']
): layout is PdJson.SliderLayout => nodeType === 'vsl' || nodeType === 'hsl'

const isRadioLayout = (
    nodeType: PdJson.ObjectType,
    layout: PdJson.ControlNode['layout']
): layout is PdJson.RadioLayout =>
    nodeType === 'vradio' || nodeType === 'hradio'

const isVuLayout = (
    nodeType: PdJson.ObjectType,
    layout: PdJson.ControlNode['layout']
): layout is PdJson.VuLayout => nodeType === 'vu'

const isCnvLayout = (
    nodeType: PdJson.ObjectType,
    layout: PdJson.ControlNode['layout']
): layout is PdJson.CnvLayout => nodeType === 'cnv'
