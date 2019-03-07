angular.module('app.services').factory('KnowledgeService', function (NetworkService, AppConfig, $cordovaFileTransfer, $cordovaFileOpener2, $ionicLoading, $rootScope, $cordovaFile, AccountService) {
    var typeList = [
        {
            str: 'doc',
            type: 'application/msword'
        }, {
            str: 'docx',
            type: 'application/msword'
        }, {
            str: 'xls',
            type: 'application/vnd.ms-excel'
        }, {
            str: 'xlsx',
            type: 'application/vnd.ms-excel'
        }, {
            str: 'csv',
            type: 'application/vnd.ms-excel'
        }, {
            str: 'pdf',
            type: 'application/pdf'
        }, {
            str: 'ppt',
            type: 'application/vnd.ms-powerpoint'
        }, {
            str: 'pptx',
            type: 'application/vnd.ms-powerpoint'
        }, {
            str: 'jpg',
            type: 'image/jpeg'
        }, {
            str: 'jpeg',
            type: 'image/jpeg'
        }, {
            str: 'png',
            type: 'image/png'
        }, {
            str: 'bmp',
            type: 'image/bmp'
        }, {
            str: 'gif',
            type: 'image/gif'
        }
    ];
    
    function getFileType(type) {
        var str;
        angular.forEach(typeList, function (item) {
            if (item.str == type) {
                str = item.type;
            }
        });
        return str;
    }
    
    function fileOpen(path, type) {
        $cordovaFileOpener2.open(path, type).then(
            function () {
                //success
            }, function (err) {
                //failure
                // alert(JSON.stringify(err));
            }
        );
    }
    
    function downLoadThatFile(url, path, fileType) {
        $ionicLoading.show({
            template: '<div class="http-loading"><ion-spinner icon="bubbles" class="spinner-positive"></ion-spinner><span>下载中···</span></div>',
        });
        $cordovaFileTransfer.download(
            url,
            path,
            {
                headers: {
                    'Content-Type': undefined,
                    tokenId: AccountService.getAuthToken()
                }
            },
            true
        ).then(
            function () {
                //下载成功打开文件
                $ionicLoading.hide();
                fileOpen(path, getFileType(fileType));
            },
            function (error) {
                // alert(JSON.stringify(error));
                //下载失败
                $ionicLoading.show({
                    template: '下载失败，请重试！',
                    duration: 1000
                });
            },
            function (progress) {
                //进度，这里使用文字显示下载百分比
                //     process = Math.floor(progress.loaded / progress.total * 100);
                //
                //     if (process > 99) {
                //         $ionicLoading.hide();
                //     }
            }
        )
    }
    
    return {
        fileDownload: function (filePath, fileName, fileType, fileId) {
            var path;//下载保存文件位置
            var phonePath;//检测该目录下是否存在同名文件
            var url = AppConfig.DOWNLOAD_EXPORT_USER.url + '/' + fileId;//服务器请求地址
    
            if ($rootScope.system === 'ios') {
                fileName = fileId + '.' + fileType;
                path = cordova.file.dataDirectory + fileName;
                phonePath = cordova.file.dataDirectory;
            } else if ($rootScope.system === 'Android') {
                fileName = fileName + '.' + fileType;
                path = cordova.file.externalRootDirectory + "Download/" + fileName;
                phonePath = cordova.file.externalRootDirectory + "Download/";
            }
    
            //检查文件是否存在
            $cordovaFile.checkFile(phonePath, fileName).then(
                function () {
                    //检测到同名文件 删除该文件
                    $cordovaFile.removeFile(phonePath, fileName).then(
                        function (res) {
                            //删除成功  下载服务器文件
                            if (res.success) {
                                //下载文件
                                downLoadThatFile(url, path, fileType);
                            }
                        }, function () {
                            //删除失败  提示
                            $ionicLoading.show({
                                template: "该目录下已存在相同文件，请手动删除！",
                                duration: 1000
                            });
                        }
                    );
                }, function (err) {
                    //未检测到同名文件 直接下载
                    if (err.code == 1) {
                        downLoadThatFile(url, path, fileType);
                    }
                }
            );
            
        },
        fileOpen: function (path, type) {
            $cordovaFileOpener2.open(path, type).then(
                function () {
                    //success
                }, function (err) {
                    //failure
                    // alert(JSON.stringify(err));
                }
            );
        },
        fileCheck: function () {
            $cordovaFile.checkFile(path, file).then(
                function () {
                    //success
                }, function (err) {
                    //failure
                    // alert(JSON.stringify(err));
                }
            );
        },
        fileRemove: function () {
            $cordovaFile.removeFile(path, fileName).then(
                function () {
                    //success
                }, function (err) {
                    //failure
                    // alert(JSON.stringify(err));
                }
            );
        },
        getFileList: function (data) {
            var req = angular.extend({
                data: data
            }, AppConfig.SEARCH_REPOSITORY_FILE);
            return NetworkService.httpExecute(req);
        },
        getFileMimeType: function (fileType) {
            var str;
            angular.forEach(typeList, function (item) {
                if (item.str == fileType) {
                    str = item.type;
                }
            });
            return str;
        },
        getFileTypeStr: function () {
            var array = [];
            var str;
            angular.forEach(typeList, function (item) {
                array.push(item.str);
            });
            str = array.join(',');
            return str;
        }
    }
});