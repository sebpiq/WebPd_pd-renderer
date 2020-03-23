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
import TEST_PATCHES from '@webpd/shared/test-patches'
import parse from '@webpd/pd-parser/src/parse'
const NEWLINE_REGEX = /\r?\n/

describe('render', () => {
    
    it('should succeed rendering simple patch', () => {
        const pd = parse(TEST_PATCHES.simple)
        assert.deepEqual(
            render(pd).split(NEWLINE_REGEX),
            TEST_PATCHES.simple.split(NEWLINE_REGEX)
        )
    })

    it('should succeed rendering subpatches', () => {
        const pd = parse(TEST_PATCHES.subpatches)
        assert.deepEqual(
            render(pd).split(NEWLINE_REGEX),
            TEST_PATCHES.subpatches.split(NEWLINE_REGEX)
        )
    })

    it('should succeed rendering subpatches', () => {
        const pd = parse(TEST_PATCHES.nodeElems)
        assert.deepEqual(
            render(pd).split(NEWLINE_REGEX),
            TEST_PATCHES.nodeElems.split(NEWLINE_REGEX)
        )
    })
})
