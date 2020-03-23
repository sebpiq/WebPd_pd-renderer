import assert from 'assert'
import render from './render'
import TEST_PATCHES from '@webpd/shared/test-patches'
const NEWLINE_REGEX = /\r?\n/

describe('render', () => {
    it('should succeed parsing/rendering all test patches identically', () => {
        const pd: PdJson.Pd = {
            arrays: {},
            patches: {
                '0': {
                    id: '0',
                    args: [10],
                    layout: {
                        x: 778,
                        y: 17,
                        width: 450,
                        height: 300,
                    },
                    nodes: {
                        '0': {
                            id: '0',
                            proto: 'loadbang',
                            args: [],
                            layout: {
                                x: 14,
                                y: 13,
                            },
                        },
                        '1': {
                            id: '1',
                            proto: 'print',
                            args: ['bla'],
                            layout: {
                                x: 14,
                                y: 34,
                            },
                        },
                    },
                    connections: [
                        {
                            source: { id: '0', port: 0 },
                            sink: { id: '1', port: 0 },
                        },
                    ],
                },
            },
        }
        assert.deepEqual(
            render(pd).split(NEWLINE_REGEX),
            TEST_PATCHES.simple.split(NEWLINE_REGEX)
        )
    })
})
