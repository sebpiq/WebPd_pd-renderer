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
    return renderPatch(pd.patches['0'])
}

const renderPatch = (patch: PdJson.Patch, root = false): Pd.PdString => {
    let rendered: Pd.PdString = ''
    const l = defaults({}, patch.layout, {
        x: 0,
        y: 0,
        width: 500,
        height: 500,
    })
    const a = patch.args

    rendered += `#N canvas ${l.x} ${l.y} ${l.width} ${l.height} ${a[0]}${
        isUndefined(l.openOnLoad) ? '' : ' ' + l.openOnLoad
    };\n`
    rendered += Object.values(patch.nodes)
        .sort(_nodesSort)
        .map(renderNode)
        .join('')
    rendered += patch.connections.map(renderConnection).join('')

    return rendered
}

const renderNode = (node: PdJson.GenericNode): Pd.PdString => {
    const l = defaults({}, node.layout, { x: 0, y: 0 })
    const a = node.args
    return `#X obj ${l.x} ${l.y} ${node.proto}${
        a.length ? ' ' + a.join(' ') : ''
    };\n`
}

const renderConnection = ({ source, sink }: PdJson.Connection): Pd.PdString =>
    `#X connect ${source.id} ${source.port} ${sink.id} ${sink.port};\n`

// var canvasTpl =
//         '#N canvas {{{layout.x}}} {{{layout.y}}} {{{layout.width}}} {{{layout.height}}} {{{args.0}}}{{#layout.openOnLoad}} {{{.}}}{{/layout.openOnLoad}}',
//     connectTpl =
//         '#X connect {{{source.id}}} {{{source.port}}} {{{sink.id}}} {{{sink.port}}}'

// var floatAtomTpl =
//         '#X floatatom {{{layout.x}}} {{{layout.y}}} {{{layout.width}}} {{{args.0}}} {{{args.1}}} {{{layout.labelPos}}} {{{layout.label}}} {{{args.2}}} {{{args.3}}}',
//     symbolAtomTpl =
//         '#X symbolatom {{{layout.x}}} {{{layout.y}}} {{{layout.width}}} {{{args.0}}} {{{args.1}}} {{{layout.labelPos}}} {{{layout.label}}} {{{args.2}}} {{{args.3}}}',
//     bngTpl =
//         '#X obj {{{layout.x}}} {{{layout.y}}} bng {{{layout.size}}} {{{layout.hold}}} {{{layout.interrupt}}} {{{args.0}}} {{{args.1}}} {{{args.2}}} {{{layout.label}}} {{{layout.labelX}}} {{{layout.labelY}}} {{{layout.labelFont}}} {{{layout.labelFontSize}}} {{{layout.bgColor}}} {{{layout.fgColor}}} {{{layout.labelColor}}}',
//     nbxTpl =
//         '#X obj {{{layout.x}}} {{{layout.y}}} nbx {{{layout.size}}} {{{layout.height}}} {{{args.0}}} {{{args.1}}} {{{layout.log}}} {{{args.2}}} {{{args.3}}} {{{args.4}}} {{{layout.label}}} {{{layout.labelX}}} {{{layout.labelY}}} {{{layout.labelFont}}} {{{layout.labelFontSize}}} {{{layout.bgColor}}} {{{layout.fgColor}}} {{{layout.labelColor}}} {{{layout.logHeight}}}',
//     vslTpl =
//         '#X obj {{{layout.x}}} {{{layout.y}}} vsl {{{layout.width}}} {{{layout.height}}} {{{args.0}}} {{{args.1}}} {{{layout.log}}} {{{args.2}}} {{{args.3}}} {{{args.4}}} {{{layout.label}}} {{{layout.labelX}}} {{{layout.labelY}}} {{{layout.labelFont}}} {{{layout.labelFontSize}}} {{{layout.bgColor}}} {{{layout.fgColor}}} {{{layout.labelColor}}} {{{args.5}}} {{{layout.steadyOnClick}}}',
//     hslTpl =
//         '#X obj {{{layout.x}}} {{{layout.y}}} hsl {{{layout.width}}} {{{layout.height}}} {{{args.0}}} {{{args.1}}} {{{layout.log}}} {{{args.2}}} {{{args.3}}} {{{args.4}}} {{{layout.label}}} {{{layout.labelX}}} {{{layout.labelY}}} {{{layout.labelFont}}} {{{layout.labelFontSize}}} {{{layout.bgColor}}} {{{layout.fgColor}}} {{{layout.labelColor}}} {{{args.5}}} {{{layout.steadyOnClick}}}',
//     vradioTpl =
//         '#X obj {{{layout.x}}} {{{layout.y}}} vradio {{{layout.size}}} {{{args.0}}} {{{args.1}}} {{{args.2}}} {{{args.3}}} {{{args.4}}} {{{layout.label}}} {{{layout.labelX}}} {{{layout.labelY}}} {{{layout.labelFont}}} {{{layout.labelFontSize}}} {{{layout.bgColor}}} {{{layout.fgColor}}} {{{layout.labelColor}}} {{{args.5}}}',
//     hradioTpl =
//         '#X obj {{{layout.x}}} {{{layout.y}}} hradio {{{layout.size}}} {{{args.0}}} {{{args.1}}} {{{args.2}}} {{{args.3}}} {{{args.4}}} {{{layout.label}}} {{{layout.labelX}}} {{{layout.labelY}}} {{{layout.labelFont}}} {{{layout.labelFontSize}}} {{{layout.bgColor}}} {{{layout.fgColor}}} {{{layout.labelColor}}} {{{args.5}}}',
//     vuTpl =
//         '#X obj {{{layout.x}}} {{{layout.y}}} vu {{{layout.width}}} {{{layout.height}}} {{{args.0}}} {{{layout.label}}} {{{layout.labelX}}} {{{layout.labelY}}} {{{layout.labelFont}}} {{{layout.labelFontSize}}} {{{layout.bgColor}}} {{{layout.labelColor}}} {{{layout.log}}} {{{args.1}}}',
//     cnvTpl =
//         '#X obj {{{layout.x}}} {{{layout.y}}} cnv {{{layout.size}}} {{{layout.width}}} {{{layout.height}}} {{{args.0}}} {{{args.1}}} {{{layout.label}}} {{{layout.labelX}}} {{{layout.labelY}}} {{{layout.labelFont}}} {{{layout.labelFontSize}}} {{{layout.bgColor}}} {{{layout.labelColor}}} {{{args.2}}}',
//     objTpl =
//         '#X obj {{{layout.x}}} {{{layout.y}}} {{{proto}}}{{#args}} {{.}}{{/args}}'
