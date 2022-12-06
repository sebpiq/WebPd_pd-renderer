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

import assert from 'assert'
import render from './render'
import TEST_PATCHES from '@webpd/pd-json/test-patches'
import { pdJsonNodeDefaults } from '@webpd/pd-json/src/test-helpers'
import parse, { nextPatchId } from '@webpd/pd-parser/src/parse'
import { PdJson } from '@webpd/pd-json'
const NEWLINE_REGEX = /\r?\n/

describe('render', () => {
    beforeEach(() => {
        nextPatchId.counter = -1
    })

    it('should succeed rendering simple patch', () => {
        const pd = parse(TEST_PATCHES.simple)
        assert.deepEqual(
            render(pd, '0').split(NEWLINE_REGEX),
            TEST_PATCHES.simple.split(NEWLINE_REGEX)
        )
    })

    it('should succeed rendering subpatches', () => {
        const pd = parse(TEST_PATCHES.subpatches)
        assert.deepEqual(
            render(pd, '0').split(NEWLINE_REGEX),
            TEST_PATCHES.subpatches.split(NEWLINE_REGEX)
        )
    })

    it('should succeed rendering GUI elems', () => {
        const pd = parse(TEST_PATCHES.nodeElems)
        assert.deepEqual(
            render(pd, '0').split(NEWLINE_REGEX),
            TEST_PATCHES.nodeElems.split(NEWLINE_REGEX)
        )
    })

    it('should render simple patch with no args', () => {
        const pd: PdJson.Pd = {
            arrays: {},
            patches: {
                '0': {
                    id: '0',
                    args: [],
                    inlets: [],
                    outlets: [],
                    nodes: {},
                    connections: [],
                },
            },
        }
        const rendered = render(pd, '0')
        assert.strictEqual(rendered, '#N canvas 0 0 500 500 10;\n')
    })

    it('should reassign new ids for correct connections', () => {
        const pd: PdJson.Pd = {
            arrays: {},
            patches: {
                '0': {
                    id: '0',
                    args: [],
                    inlets: [],
                    outlets: [],
                    nodes: {
                        superNode666: {
                            ...pdJsonNodeDefaults('superNode666'),
                            args: [666],
                        },
                        superNode999: {
                            ...pdJsonNodeDefaults('superNode999'),
                            args: [999],
                        },
                    },
                    connections: [
                        {
                            source: { nodeId: 'superNode666', portletId: 0 },
                            sink: { nodeId: 'superNode999', portletId: 0 },
                        },
                    ],
                },
            },
        }

        const rendered = render(pd, '0')
        assert.strictEqual(
            rendered,
            '#N canvas 0 0 500 500 10;\n' +
                '#X obj 0 0 DUMMY 666;\n' +
                '#X obj 0 0 DUMMY 999;\n' +
                '#X connect 0 0 1 0;\n'
        )
    })
})
