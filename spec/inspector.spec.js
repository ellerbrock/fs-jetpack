"use strict";

describe('inspector |', function () {
    
    var fse = require('fs-extra');
    var pathUtil = require('path');
    var helper = require('./helper');
    var jetpack = require('..');
    
    beforeEach(helper.beforeEach);
    afterEach(helper.afterEach);
    
    // prepare files and directories structure to test on
    beforeEach(function () {
        fse.mkdirsSync('dir/empty');
        fse.outputFileSync('dir/file.txt', 'abc');
        fse.outputFileSync('dir/subdir/file.txt', 'defg');
    });
    
    describe('inspect', function () {
        
        it('can inspect a file', function (done) {
            
            function expectations(data) {
                expect(data).toEqual({
                    name: 'file.txt',
                    type: 'file',
                    size: 3,
                });
            }
            
            // SYNC
            var data = jetpack.inspect('dir/file.txt');
            expectations(data);
            
            // ASYNC
            jetpack.inspectAsync('dir/file.txt')
            .then(function (data) {
                expectations(data);
                done();
            });
        });
        
        it('can inspect a directory', function (done) {
            
            function expectations(data) {
                expect(data).toEqual({
                    name: 'empty',
                    type: 'dir',
                });
            }
            
            // SYNC
            var data = jetpack.inspect('dir/empty');
            expectations(data);
            
            // ASYNC
            jetpack.inspectAsync('dir/empty')
            .then(function (data) {
                expectations(data);
                done();
            });
        });
        
        it("returns null if path doesn't exist", function (done) {
            // SYNC
            var data = jetpack.inspect('nonexistent');
            expect(data).toBe(null);
            
            // ASYNC
            jetpack.inspectAsync('nonexistent')
            .then(function (data) {
                expect(data).toBe(null);
                done();
            });
        });
        
        it('can output md5 checksum of a file', function (done) {
            
            function expectations(data) {
                expect(data).toEqual({
                    name: 'file.txt',
                    type: 'file',
                    size: 3,
                    md5: '900150983cd24fb0d6963f7d28e17f72' // md5 of 'abc'
                });
            }
            
            // SYNC
            var data = jetpack.inspect('dir/file.txt', { checksum: 'md5' });
            expectations(data);
            
            // ASYNC
            jetpack.inspectAsync('dir/file.txt', { checksum: 'md5' })
            .then(function (data) {
                expectations(data);
                done();
            });
        });
        
        it('can output sha1 checksum of a file', function (done) {
            
            function expectations(data) {
                expect(data).toEqual({
                    name: 'file.txt',
                    type: 'file',
                    size: 3,
                    sha1: 'a9993e364706816aba3e25717850c26c9cd0d89d' // sha1 of 'abc'
                });
            }
            
            // SYNC
            var data = jetpack.inspect('dir/file.txt', { checksum: 'sha1' });
            expectations(data);
            
            // ASYNC
            jetpack.inspectAsync('dir/file.txt', { checksum: 'sha1' })
            .then(function (data) {
                expectations(data);
                done();
            });
        });
        
    });
    
    describe('list', function () {
        
        it('lists file names by default', function (done) {
            
            function expectations(data) {
                expect(data).toEqual(['empty', 'file.txt', 'subdir']);
            }
            
            // SYNC
            var list = jetpack.list('dir');
            expectations(list);
            
            // ASYNC
            jetpack.listAsync('dir')
            .then(function (list) {
                expectations(list);
                done();
            });
        });
        
        it('lists inspect objects if that option specified', function (done) {
            
            function expectations(data) {
                expect(data).toEqual([
                    {
                        name: 'empty',
                        type: 'dir',
                    },{
                        name: 'file.txt',
                        type: 'file',
                        size: 3,
                    },{
                        name: 'subdir',
                        type: 'dir',
                    }
                ]);
            }
            
            // SYNC
            var list = jetpack.list('dir', true);
            expectations(list);
            
            // ASYNC
            jetpack.listAsync('dir', true)
            .then(function (list) {
                expectations(list);
                done();
            });
        });
        
        it('lists inspect objects with config', function (done) {
            
            function expectations(data) {
                expect(data).toEqual([
                    {
                        name: 'empty',
                        type: 'dir',
                    },{
                        name: 'file.txt',
                        type: 'file',
                        size: 3,
                        md5: '900150983cd24fb0d6963f7d28e17f72' // md5 of 'abc'
                    },{
                        name: 'subdir',
                        type: 'dir',
                    }
                ]);
            }
            
            // SYNC
            var list = jetpack.list('dir', { checksum: 'md5' });
            expectations(list);
            
            // ASYNC
            jetpack.listAsync('dir', { checksum: 'md5' })
            .then(function (list) {
                expectations(list);
                done();
            });
        });
        
        it("returns null if path doesn't exist", function (done) {
            // SYNC
            var data = jetpack.list('nonexistent');
            expect(data).toBe(null);
            
            // ASYNC
            jetpack.listAsync('nonexistent')
            .then(function (data) {
                expect(data).toBe(null);
                done();
            });
        });
        
    });
    
    describe('inspectTree', function () {
        
        it('crawls a directory tree', function (done) {
            
            function expectations(data) {
                expect(data).toEqual({
                    name: 'dir',
                    type: 'dir',
                    size: 7,
                    children: [
                        {
                            name: 'empty',
                            type: 'dir',
                            size: 0, // the directory is empty
                            children: []
                        },{
                            name: 'file.txt',
                            type: 'file',
                            size: 3
                        },{
                            name: 'subdir',
                            type: 'dir',
                            size: 4,
                            children: [
                                {
                                    name: 'file.txt',
                                    type: 'file',
                                    size: 4
                                }
                            ]
                        }
                    ]
                });
            }
            
            // SYNC
            var tree = jetpack.inspectTree('dir');
            expectations(tree);
            
            // ASYNC
            jetpack.inspectTreeAsync('dir')
            .then(function (tree) {
                expectations(tree);
                done();
            });
        });
        
        it('can compute md5 checksum of whole tree', function (done) {
            
            function expectations(data) {
                expect(data).toEqual({
                    name: 'dir',
                    type: 'dir',
                    size: 7,
                    md5: '0dc3266b245151cda5c56c7f62439202',
                    // md5 of 'emptyfile.txt900150983cd24fb0d6963f7d28e17f72subdir11c68d9ad988ff4d98768193ab66a646'
                    children: [
                        {
                            name: 'empty',
                            type: 'dir',
                            size: 0,
                            md5: null, // empty directory can't have md5
                            children: []
                        },{
                            name: 'file.txt',
                            type: 'file',
                            size: 3,
                            md5: '900150983cd24fb0d6963f7d28e17f72' // md5 of 'abc'
                        },{
                            name: 'subdir',
                            type: 'dir',
                            size: 4,
                            md5: '11c68d9ad988ff4d98768193ab66a646',
                            // md5 of 'file.txt025e4da7edac35ede583f5e8d51aa7ec'
                            children: [
                                {
                                    name: 'file.txt',
                                    type: 'file',
                                    size: 4,
                                    md5: '025e4da7edac35ede583f5e8d51aa7ec' // md5 of 'defg'
                                }
                            ]
                        }
                    ]
                });
            }
            
            // SYNC
            var tree = jetpack.inspectTree('dir', { checksum: 'md5' });
            expectations(tree);
            
            // ASYNC
            jetpack.inspectTreeAsync('dir', { checksum: 'md5' })
            .then(function (tree) {
                expectations(tree);
                done();
            });
        });
        
        it('if given path is a file still works OK', function (done) {
            
            function expectations(data) {
                expect(data).toEqual({
                    name: 'file.txt',
                    type: 'file',
                    size: 3
                });
            }
            
            // SYNC
            var tree = jetpack.inspectTree('dir/file.txt');
            expectations(tree);
            
            // ASYNC
            jetpack.inspectTreeAsync('dir/file.txt')
            .then(function (tree) {
                expectations(tree);
                done();
            });
        });
        
        it("returns null if path doesn't exist", function (done) {
            // SYNC
            var data = jetpack.inspectTree('nonexistent');
            expect(data).toBe(null);
            
            // ASYNC
            jetpack.inspectTreeAsync('nonexistent')
            .then(function (data) {
                expect(data).toBe(null);
                done();
            });
        });
        
    });
    
});
