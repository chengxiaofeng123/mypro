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
            template: '<div class="http-loading"><ion-spinner icon="bubbles" class="spinner-positive"></ion-spinner><span>�����С�����</span></div>',
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
                //���سɹ����ļ�
                $ionicLoading.hide();
                fileOpen(path, getFileType(fileType));
            },
            function (error) {
                // alert(JSON.stringify(error));
                //����ʧ��
                $ionicLoading.show({
                    template: '����ʧ�ܣ������ԣ�',
                    duration: 1000
                });
            },
            function (progress) {
                //���ȣ�����ʹ��������ʾ���ذٷֱ�
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
            var path;//���ر����ļ�λ��
            var phonePath;//����Ŀ¼���Ƿ����ͬ���ļ�
            var url = AppConfig.DOWNLOAD_EXPORT_USER.url + '/' + fileId;//�����������ַ
    
            if ($rootScope.system === 'ios') {
                fileName = fileId + '.' + fileType;
                path = cordova.file.dataDirectory + fileName;
                phonePath = cordova.file.dataDirectory;
            } else if ($rootScope.system === 'Android') {
                fileName = fileName + '.' + fileType;
                path = cordova.file.externalRootDirectory + "Download/" + fileName;
                phonePath = cordova.file.externalRootDirectory + "Download/";
            }
    
            //����ļ��Ƿ����
            $cordovaFile.checkFile(phonePath, fileName).then(
                function () {
                    //��⵽ͬ���ļ� ɾ�����ļ�
                    $cordovaFile.removeFile(phonePath, fileName).then(
                        function (res) {
                            //ɾ���ɹ�  ���ط������ļ�
                            if (res.success) {
                                //�����ļ�
                                downLoadThatFile(url, path, fileType);
                            }
                        }, function () {
                            //ɾ��ʧ��  ��ʾ
                            $ionicLoading.show({
                                template: "��Ŀ¼���Ѵ�����ͬ�ļ������ֶ�ɾ����",
                                duration: 1000
                            });
                        }
                    );
                }, function (err) {
                    //δ��⵽ͬ���ļ� ֱ������
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