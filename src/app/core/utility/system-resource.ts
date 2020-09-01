export class SystemResourceConfig {
    public static SysRconfig = require('../../../assets/webConfig.js');
}

export const SystemResource_1 = {
    // 实施本地
    'url_localhost_8084': {
        localResourceUrl: 'localhost:8084',
        /** 后台服务 */
        settingSystemServer: 'localhost:8081',
        /** 后台服务 */
        appSystemServer: 'localhost:8081',
        /**报表  */
        reportServerUrl: 'localhost:8088'
    },
    // 研发本地
    'url_localhost_4200': {
        localResourceUrl: 'localhost:4200',
        /** 后台服务 */
        settingSystemServer: '192.168.1.105:8080',//'10.129.150.111:8081',
        /** 后台服务 */
        appSystemServer: '192.168.1.105:8080', //,'10.129.150.111:8081'
        /**报表  */
        reportServerUrl: '10.129.150.111:8084',//'192.168.1.111:8088'
    },
    'url_192_168_1_111_8084': {
        localResourceUrl: '192.168.1.111:8084',
        /** 后台服务 */
        settingSystemServer: '192.168.1.111:8081',
        /** 后台服务 */
        appSystemServer: '192.168.1.111:8081',
        /**报表  */
        reportServerUrl: '192.168.1.111:8088'
    },
    'url_192_168_1_200_8082': {
        localResourceUrl: '192.168.1.200:8082',
        /** 后台服务 */
        settingSystemServer: '192.168.1.200:8072',
        /** 后台服务 */
        appSystemServer: '192.168.1.200:8072',
        /**报表  */
        reportServerUrl: '192.168.1.200:8088'
    },
    'url_10_10_63_249_8081': {
        localResourceUrl: '10.10.63.249:8081',
        /** 后台服务 */
        settingSystemServer: '10.10.63.249:8072',
        /** 后台服务 */
        appSystemServer: '10.10.63.249:8072',
        /**报表  */
        reportServerUrl: '10.10.63.249:8088'
    },
    'url_10_129_7_4_8084': {
        localResourceUrl: '10.129.7.4:8084',
        /** 后台服务 */
        settingSystemServer: '10.129.7.4:8081',
        /** 后台服务 */
        appSystemServer: '10.129.7.4:8081',
        /**报表  */
        reportServerUrl: '10.129.7.4:8088'
    },
    'url_192_168_0_10_8084': {
        localResourceUrl: '192.168.0.10:8084',
        /** 后台服务 */
        settingSystemServer: '192.168.0.10:8081',
        /** 后台服务 */
        appSystemServer: '192.168.0.10:8081',
        /**报表  */
        reportServerUrl: '192.168.0.10:8088'
    },
    'url_10_129_150_111_8084': {
        localResourceUrl: '10.129.150.111:8084',
        /** 后台服务 */
        settingSystemServer: '10.129.150.111:8081',
        /** 后台服务 */
        appSystemServer: '10.129.150.111:8081',
        /**报表  */
        reportServerUrl: '10.129.150.111:8088'
    },
    'url_10_129_203_33_8084': {
        localResourceUrl: '10.129.203.33:8084',
        /** 后台服务 */
        settingSystemServer: '10.129.203.33:8081',
        /** 后台服务 */
        appSystemServer: '10.129.203.33:8081',
        /**报表  */
        reportServerUrl: '10.129.203.33:8088'
      },
    // 7416
    'url_192_168_250_232_8084': {
        localResourceUrl: '192.168.250.232:8084',
        /** 后台服务 */
        settingSystemServer: '192.168.250.232:8081',
        /** 后台服务 */
        appSystemServer: '192.168.250.232:8081',
        /**报表  */
        reportServerUrl: '192.168.250.232:8088'
    },
    // 西点集团触摸屏
    'url_10_10_63_249_8082': {
        localResourceUrl: '10.10.63.249:8082',
        /** 后台服务 */
        settingSystemServer: '192.168.1.200:8072',
        /** 后台服务 */
        appSystemServer: '192.168.1.200:8072',
        /**报表  */
        reportServerUrl: '192.168.1.200:8088'
    },
    'url_39_101_168_200_8042': {
        localResourceUrl: '39.101.168.200:8042',
        /** 后台服务 */
        settingSystemServer: '39.101.168.200:8040',
        /** 后台服务 */
        appSystemServer: '39.101.168.200:8040',
        /**报表  */
        reportServerUrl: '39.101.168.200:8043'
    },
    'url_39_101_168_200_8013': {
        localResourceUrl: '39.101.168.200:8013',
        /** 后台服务 */
        settingSystemServer: '39.101.168.200:8010',
        /** 后台服务 */
        appSystemServer: '39.101.168.200:8010',
        /**报表  */
        reportServerUrl: '39.101.168.200:8012'
      },
      'url_39_101_168_200_8023': {
        localResourceUrl: '39.101.168.200:8023',
        /** 后台服务 */
        settingSystemServer: '39.101.168.200:8020',
        /** 后台服务 */
        appSystemServer: '39.101.168.200:8020',
        /**报表  */
        reportServerUrl: '39.101.168.200:8022'
      },
      'url_39_101_168_200_8033': {
        localResourceUrl: '39.101.168.200:8033',
        /** 后台服务 */
        settingSystemServer: '39.101.168.200:8030',
        /** 后台服务 */
        appSystemServer: '39.101.168.200:8030',
        /**报表  */
        reportServerUrl: '39.101.168.200:8032'
      }
}



export class SystemResource {
    public static settingSystem = {
        name: 'setting',
        // Server: 'http://127.0.0.1:8081/api.cfg/'
        // Server: 'http://192.168.1.111:8081/api.cfg/'
        // 'Server': 'http://192.168.1.252:8081/api.cfg/'
        Server: SystemResourceConfig.SysRconfig.settingSystemServer
    };

    public static appSystem = {
        name: 'app',
        // Server: 'http://127.0.0.1:8081/api.cfg/'
        // Server: 'http://192.168.1.111:8081/api.cfg/'
        // 'Server': 'http://192.168.1.252:8081/api.cfg/'
        Server: SystemResourceConfig.SysRconfig.appSystemServer
    };

    public static localResource = {
        // url: "http://192.168.1.111:8083"
        //  url: 'http://localhost:4200'
        url: SystemResourceConfig.SysRconfig.localResourceUrl
    };

    public static localResourceConfigJson = {
        url: 'files/moduleConfig/',
        reportTemplate: 'files/reportTemplate/'
    }


    public static reportServer = {
        // url: 'http://192.168.1.111:8081/api.cfg/files/reportTemplate/',         
        // url: 'http://127.0.0.1:8081/api.cfg/files/reportTemplate/',
        // url: 'http://192.168.1.111:8088/ReportServer.ashx'
        url: SystemResourceConfig.SysRconfig.reportServerUrl
    }
}
