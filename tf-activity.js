/* Track Ford participation capture v1. Future explicit submissions only.
 * This module never writes native learner storage, calculates points, or changes grades.
 * Authentication, durable queuing and account-scoped deduplication belong to TFC.
 */
(function () {
  'use strict';
  if (window.TFActivity && window.TFActivity.version === 1) return;
  let initialized = false;
  const CATALOG = {"activity:arena:case":{"kind":"activity","points":5},"activity:arena:classify":{"kind":"activity","points":5},"activity:arena:incident":{"kind":"activity","points":5},"activity:arena:lines":{"kind":"activity","points":5},"activity:arena:match":{"kind":"activity","points":5},"activity:arena:order":{"kind":"activity","points":5},"activity:arena:team":{"kind":"activity","points":5},"activity:arena:viva":{"kind":"activity","points":5},"activity:exam:1":{"kind":"activity","points":5},"activity:exam:2":{"kind":"activity","points":5},"activity:exam:3":{"kind":"activity","points":5},"activity:exam:d1":{"kind":"activity","points":5},"activity:exam:d2":{"kind":"activity","points":5},"activity:exam:d3":{"kind":"activity","points":5},"activity:exam:d4":{"kind":"activity","points":5},"activity:exam:d5":{"kind":"activity","points":5},"activity:exam:free":{"kind":"activity","points":5},"plan:1.0":{"kind":"activity","points":5},"plan:1.1":{"kind":"activity","points":5},"plan:1.2":{"kind":"activity","points":5},"plan:1.3":{"kind":"activity","points":5},"plan:10.0":{"kind":"activity","points":5},"plan:10.1":{"kind":"activity","points":5},"plan:10.2":{"kind":"activity","points":5},"plan:10.3":{"kind":"activity","points":5},"plan:11.0":{"kind":"activity","points":5},"plan:11.1":{"kind":"activity","points":5},"plan:11.2":{"kind":"activity","points":5},"plan:11.3":{"kind":"activity","points":5},"plan:12.0":{"kind":"activity","points":5},"plan:12.1":{"kind":"activity","points":5},"plan:12.2":{"kind":"activity","points":5},"plan:12.3":{"kind":"activity","points":5},"plan:13.0":{"kind":"activity","points":5},"plan:13.1":{"kind":"activity","points":5},"plan:13.2":{"kind":"activity","points":5},"plan:13.3":{"kind":"activity","points":5},"plan:14.0":{"kind":"activity","points":5},"plan:14.1":{"kind":"activity","points":5},"plan:14.2":{"kind":"activity","points":5},"plan:14.3":{"kind":"activity","points":5},"plan:2.0":{"kind":"activity","points":5},"plan:2.1":{"kind":"activity","points":5},"plan:2.2":{"kind":"activity","points":5},"plan:2.3":{"kind":"activity","points":5},"plan:3.0":{"kind":"activity","points":5},"plan:3.1":{"kind":"activity","points":5},"plan:3.2":{"kind":"activity","points":5},"plan:3.3":{"kind":"activity","points":5},"plan:4.0":{"kind":"activity","points":5},"plan:4.1":{"kind":"activity","points":5},"plan:4.2":{"kind":"activity","points":5},"plan:4.3":{"kind":"activity","points":5},"plan:5.0":{"kind":"activity","points":5},"plan:5.1":{"kind":"activity","points":5},"plan:5.2":{"kind":"activity","points":5},"plan:5.3":{"kind":"activity","points":5},"plan:6.0":{"kind":"activity","points":5},"plan:6.1":{"kind":"activity","points":5},"plan:6.2":{"kind":"activity","points":5},"plan:6.3":{"kind":"activity","points":5},"plan:7.0":{"kind":"activity","points":5},"plan:7.1":{"kind":"activity","points":5},"plan:7.2":{"kind":"activity","points":5},"plan:7.3":{"kind":"activity","points":5},"plan:8.0":{"kind":"activity","points":5},"plan:8.1":{"kind":"activity","points":5},"plan:8.2":{"kind":"activity","points":5},"plan:8.3":{"kind":"activity","points":5},"plan:9.0":{"kind":"activity","points":5},"plan:9.1":{"kind":"activity","points":5},"plan:9.2":{"kind":"activity","points":5},"plan:9.3":{"kind":"activity","points":5},"question:bank:1":{"kind":"question","points":1},"question:bank:10":{"kind":"question","points":1},"question:bank:100":{"kind":"question","points":1},"question:bank:1001":{"kind":"question","points":1},"question:bank:1002":{"kind":"question","points":1},"question:bank:1003":{"kind":"question","points":1},"question:bank:1004":{"kind":"question","points":1},"question:bank:1005":{"kind":"question","points":1},"question:bank:1006":{"kind":"question","points":1},"question:bank:1007":{"kind":"question","points":1},"question:bank:1008":{"kind":"question","points":1},"question:bank:1009":{"kind":"question","points":1},"question:bank:101":{"kind":"question","points":1},"question:bank:1010":{"kind":"question","points":1},"question:bank:1011":{"kind":"question","points":1},"question:bank:1012":{"kind":"question","points":1},"question:bank:1013":{"kind":"question","points":1},"question:bank:1014":{"kind":"question","points":1},"question:bank:1015":{"kind":"question","points":1},"question:bank:1016":{"kind":"question","points":1},"question:bank:1017":{"kind":"question","points":1},"question:bank:1018":{"kind":"question","points":1},"question:bank:1019":{"kind":"question","points":1},"question:bank:102":{"kind":"question","points":1},"question:bank:1020":{"kind":"question","points":1},"question:bank:1021":{"kind":"question","points":1},"question:bank:1022":{"kind":"question","points":1},"question:bank:1023":{"kind":"question","points":1},"question:bank:1024":{"kind":"question","points":1},"question:bank:1025":{"kind":"question","points":1},"question:bank:1026":{"kind":"question","points":1},"question:bank:1027":{"kind":"question","points":1},"question:bank:1028":{"kind":"question","points":1},"question:bank:1029":{"kind":"question","points":1},"question:bank:103":{"kind":"question","points":1},"question:bank:1030":{"kind":"question","points":1},"question:bank:1031":{"kind":"question","points":1},"question:bank:1032":{"kind":"question","points":1},"question:bank:1033":{"kind":"question","points":1},"question:bank:1034":{"kind":"question","points":1},"question:bank:1035":{"kind":"question","points":1},"question:bank:1036":{"kind":"question","points":1},"question:bank:1037":{"kind":"question","points":1},"question:bank:1038":{"kind":"question","points":1},"question:bank:1039":{"kind":"question","points":1},"question:bank:104":{"kind":"question","points":1},"question:bank:1040":{"kind":"question","points":1},"question:bank:1041":{"kind":"question","points":1},"question:bank:1042":{"kind":"question","points":1},"question:bank:1043":{"kind":"question","points":1},"question:bank:1044":{"kind":"question","points":1},"question:bank:1045":{"kind":"question","points":1},"question:bank:1046":{"kind":"question","points":1},"question:bank:1047":{"kind":"question","points":1},"question:bank:1048":{"kind":"question","points":1},"question:bank:1049":{"kind":"question","points":1},"question:bank:105":{"kind":"question","points":1},"question:bank:1050":{"kind":"question","points":1},"question:bank:1051":{"kind":"question","points":1},"question:bank:1052":{"kind":"question","points":1},"question:bank:1053":{"kind":"question","points":1},"question:bank:1054":{"kind":"question","points":1},"question:bank:1055":{"kind":"question","points":1},"question:bank:1056":{"kind":"question","points":1},"question:bank:1057":{"kind":"question","points":1},"question:bank:1058":{"kind":"question","points":1},"question:bank:1059":{"kind":"question","points":1},"question:bank:106":{"kind":"question","points":1},"question:bank:1060":{"kind":"question","points":1},"question:bank:1061":{"kind":"question","points":1},"question:bank:1062":{"kind":"question","points":1},"question:bank:1063":{"kind":"question","points":1},"question:bank:1064":{"kind":"question","points":1},"question:bank:1065":{"kind":"question","points":1},"question:bank:1067":{"kind":"question","points":1},"question:bank:1068":{"kind":"question","points":1},"question:bank:1069":{"kind":"question","points":1},"question:bank:107":{"kind":"question","points":1},"question:bank:1070":{"kind":"question","points":1},"question:bank:1071":{"kind":"question","points":1},"question:bank:1072":{"kind":"question","points":1},"question:bank:1073":{"kind":"question","points":1},"question:bank:1074":{"kind":"question","points":1},"question:bank:1075":{"kind":"question","points":1},"question:bank:1076":{"kind":"question","points":1},"question:bank:1077":{"kind":"question","points":1},"question:bank:1078":{"kind":"question","points":1},"question:bank:1079":{"kind":"question","points":1},"question:bank:108":{"kind":"question","points":1},"question:bank:1080":{"kind":"question","points":1},"question:bank:1081":{"kind":"question","points":1},"question:bank:1082":{"kind":"question","points":1},"question:bank:1083":{"kind":"question","points":1},"question:bank:1084":{"kind":"question","points":1},"question:bank:1085":{"kind":"question","points":1},"question:bank:1086":{"kind":"question","points":1},"question:bank:1087":{"kind":"question","points":1},"question:bank:1088":{"kind":"question","points":1},"question:bank:1089":{"kind":"question","points":1},"question:bank:109":{"kind":"question","points":1},"question:bank:1090":{"kind":"question","points":1},"question:bank:1091":{"kind":"question","points":1},"question:bank:1092":{"kind":"question","points":1},"question:bank:1093":{"kind":"question","points":1},"question:bank:1094":{"kind":"question","points":1},"question:bank:1095":{"kind":"question","points":1},"question:bank:1096":{"kind":"question","points":1},"question:bank:1097":{"kind":"question","points":1},"question:bank:11":{"kind":"question","points":1},"question:bank:110":{"kind":"question","points":1},"question:bank:111":{"kind":"question","points":1},"question:bank:112":{"kind":"question","points":1},"question:bank:113":{"kind":"question","points":1},"question:bank:114":{"kind":"question","points":1},"question:bank:115":{"kind":"question","points":1},"question:bank:116":{"kind":"question","points":1},"question:bank:117":{"kind":"question","points":1},"question:bank:118":{"kind":"question","points":1},"question:bank:119":{"kind":"question","points":1},"question:bank:12":{"kind":"question","points":1},"question:bank:120":{"kind":"question","points":1},"question:bank:121":{"kind":"question","points":1},"question:bank:122":{"kind":"question","points":1},"question:bank:123":{"kind":"question","points":1},"question:bank:124":{"kind":"question","points":1},"question:bank:125":{"kind":"question","points":1},"question:bank:126":{"kind":"question","points":1},"question:bank:127":{"kind":"question","points":1},"question:bank:128":{"kind":"question","points":1},"question:bank:129":{"kind":"question","points":1},"question:bank:13":{"kind":"question","points":1},"question:bank:130":{"kind":"question","points":1},"question:bank:131":{"kind":"question","points":1},"question:bank:132":{"kind":"question","points":1},"question:bank:133":{"kind":"question","points":1},"question:bank:134":{"kind":"question","points":1},"question:bank:135":{"kind":"question","points":1},"question:bank:137":{"kind":"question","points":1},"question:bank:138":{"kind":"question","points":1},"question:bank:139":{"kind":"question","points":1},"question:bank:14":{"kind":"question","points":1},"question:bank:140":{"kind":"question","points":1},"question:bank:141":{"kind":"question","points":1},"question:bank:142":{"kind":"question","points":1},"question:bank:143":{"kind":"question","points":1},"question:bank:144":{"kind":"question","points":1},"question:bank:145":{"kind":"question","points":1},"question:bank:147":{"kind":"question","points":1},"question:bank:148":{"kind":"question","points":1},"question:bank:15":{"kind":"question","points":1},"question:bank:150":{"kind":"question","points":1},"question:bank:152":{"kind":"question","points":1},"question:bank:154":{"kind":"question","points":1},"question:bank:155":{"kind":"question","points":1},"question:bank:156":{"kind":"question","points":1},"question:bank:158":{"kind":"question","points":1},"question:bank:159":{"kind":"question","points":1},"question:bank:16":{"kind":"question","points":1},"question:bank:160":{"kind":"question","points":1},"question:bank:161":{"kind":"question","points":1},"question:bank:162":{"kind":"question","points":1},"question:bank:163":{"kind":"question","points":1},"question:bank:164":{"kind":"question","points":1},"question:bank:165":{"kind":"question","points":1},"question:bank:166":{"kind":"question","points":1},"question:bank:167":{"kind":"question","points":1},"question:bank:168":{"kind":"question","points":1},"question:bank:169":{"kind":"question","points":1},"question:bank:17":{"kind":"question","points":1},"question:bank:170":{"kind":"question","points":1},"question:bank:171":{"kind":"question","points":1},"question:bank:172":{"kind":"question","points":1},"question:bank:173":{"kind":"question","points":1},"question:bank:174":{"kind":"question","points":1},"question:bank:175":{"kind":"question","points":1},"question:bank:176":{"kind":"question","points":1},"question:bank:177":{"kind":"question","points":1},"question:bank:178":{"kind":"question","points":1},"question:bank:18":{"kind":"question","points":1},"question:bank:180":{"kind":"question","points":1},"question:bank:182":{"kind":"question","points":1},"question:bank:185":{"kind":"question","points":1},"question:bank:186":{"kind":"question","points":1},"question:bank:187":{"kind":"question","points":1},"question:bank:188":{"kind":"question","points":1},"question:bank:189":{"kind":"question","points":1},"question:bank:19":{"kind":"question","points":1},"question:bank:190":{"kind":"question","points":1},"question:bank:191":{"kind":"question","points":1},"question:bank:192":{"kind":"question","points":1},"question:bank:194":{"kind":"question","points":1},"question:bank:195":{"kind":"question","points":1},"question:bank:196":{"kind":"question","points":1},"question:bank:197":{"kind":"question","points":1},"question:bank:198":{"kind":"question","points":1},"question:bank:199":{"kind":"question","points":1},"question:bank:2":{"kind":"question","points":1},"question:bank:20":{"kind":"question","points":1},"question:bank:200":{"kind":"question","points":1},"question:bank:201":{"kind":"question","points":1},"question:bank:203":{"kind":"question","points":1},"question:bank:21":{"kind":"question","points":1},"question:bank:22":{"kind":"question","points":1},"question:bank:23":{"kind":"question","points":1},"question:bank:24":{"kind":"question","points":1},"question:bank:25":{"kind":"question","points":1},"question:bank:26":{"kind":"question","points":1},"question:bank:27":{"kind":"question","points":1},"question:bank:28":{"kind":"question","points":1},"question:bank:29":{"kind":"question","points":1},"question:bank:3":{"kind":"question","points":1},"question:bank:30":{"kind":"question","points":1},"question:bank:31":{"kind":"question","points":1},"question:bank:32":{"kind":"question","points":1},"question:bank:33":{"kind":"question","points":1},"question:bank:34":{"kind":"question","points":1},"question:bank:35":{"kind":"question","points":1},"question:bank:36":{"kind":"question","points":1},"question:bank:37":{"kind":"question","points":1},"question:bank:38":{"kind":"question","points":1},"question:bank:39":{"kind":"question","points":1},"question:bank:4":{"kind":"question","points":1},"question:bank:40":{"kind":"question","points":1},"question:bank:41":{"kind":"question","points":1},"question:bank:42":{"kind":"question","points":1},"question:bank:43":{"kind":"question","points":1},"question:bank:44":{"kind":"question","points":1},"question:bank:45":{"kind":"question","points":1},"question:bank:46":{"kind":"question","points":1},"question:bank:47":{"kind":"question","points":1},"question:bank:48":{"kind":"question","points":1},"question:bank:49":{"kind":"question","points":1},"question:bank:5":{"kind":"question","points":1},"question:bank:50":{"kind":"question","points":1},"question:bank:51":{"kind":"question","points":1},"question:bank:52":{"kind":"question","points":1},"question:bank:53":{"kind":"question","points":1},"question:bank:54":{"kind":"question","points":1},"question:bank:55":{"kind":"question","points":1},"question:bank:56":{"kind":"question","points":1},"question:bank:57":{"kind":"question","points":1},"question:bank:58":{"kind":"question","points":1},"question:bank:59":{"kind":"question","points":1},"question:bank:6":{"kind":"question","points":1},"question:bank:60":{"kind":"question","points":1},"question:bank:61":{"kind":"question","points":1},"question:bank:62":{"kind":"question","points":1},"question:bank:63":{"kind":"question","points":1},"question:bank:64":{"kind":"question","points":1},"question:bank:65":{"kind":"question","points":1},"question:bank:66":{"kind":"question","points":1},"question:bank:67":{"kind":"question","points":1},"question:bank:68":{"kind":"question","points":1},"question:bank:69":{"kind":"question","points":1},"question:bank:72":{"kind":"question","points":1},"question:bank:75":{"kind":"question","points":1},"question:bank:76":{"kind":"question","points":1},"question:bank:77":{"kind":"question","points":1},"question:bank:78":{"kind":"question","points":1},"question:bank:79":{"kind":"question","points":1},"question:bank:8":{"kind":"question","points":1},"question:bank:80":{"kind":"question","points":1},"question:bank:81":{"kind":"question","points":1},"question:bank:82":{"kind":"question","points":1},"question:bank:83":{"kind":"question","points":1},"question:bank:84":{"kind":"question","points":1},"question:bank:85":{"kind":"question","points":1},"question:bank:86":{"kind":"question","points":1},"question:bank:87":{"kind":"question","points":1},"question:bank:88":{"kind":"question","points":1},"question:bank:89":{"kind":"question","points":1},"question:bank:9":{"kind":"question","points":1},"question:bank:90":{"kind":"question","points":1},"question:bank:91":{"kind":"question","points":1},"question:bank:92":{"kind":"question","points":1},"question:bank:93":{"kind":"question","points":1},"question:bank:94":{"kind":"question","points":1},"question:bank:95":{"kind":"question","points":1},"question:bank:96":{"kind":"question","points":1},"question:bank:97":{"kind":"question","points":1},"question:bank:98":{"kind":"question","points":1},"sysq:0":{"kind":"question","points":1},"sysq:1":{"kind":"question","points":1},"sysq:10":{"kind":"question","points":1},"sysq:100":{"kind":"question","points":1},"sysq:101":{"kind":"question","points":1},"sysq:102":{"kind":"question","points":1},"sysq:103":{"kind":"question","points":1},"sysq:104":{"kind":"question","points":1},"sysq:105":{"kind":"question","points":1},"sysq:106":{"kind":"question","points":1},"sysq:107":{"kind":"question","points":1},"sysq:108":{"kind":"question","points":1},"sysq:109":{"kind":"question","points":1},"sysq:11":{"kind":"question","points":1},"sysq:110":{"kind":"question","points":1},"sysq:111":{"kind":"question","points":1},"sysq:112":{"kind":"question","points":1},"sysq:113":{"kind":"question","points":1},"sysq:114":{"kind":"question","points":1},"sysq:115":{"kind":"question","points":1},"sysq:116":{"kind":"question","points":1},"sysq:117":{"kind":"question","points":1},"sysq:118":{"kind":"question","points":1},"sysq:119":{"kind":"question","points":1},"sysq:12":{"kind":"question","points":1},"sysq:120":{"kind":"question","points":1},"sysq:121":{"kind":"question","points":1},"sysq:122":{"kind":"question","points":1},"sysq:123":{"kind":"question","points":1},"sysq:124":{"kind":"question","points":1},"sysq:125":{"kind":"question","points":1},"sysq:126":{"kind":"question","points":1},"sysq:127":{"kind":"question","points":1},"sysq:128":{"kind":"question","points":1},"sysq:129":{"kind":"question","points":1},"sysq:13":{"kind":"question","points":1},"sysq:130":{"kind":"question","points":1},"sysq:131":{"kind":"question","points":1},"sysq:132":{"kind":"question","points":1},"sysq:133":{"kind":"question","points":1},"sysq:134":{"kind":"question","points":1},"sysq:135":{"kind":"question","points":1},"sysq:136":{"kind":"question","points":1},"sysq:137":{"kind":"question","points":1},"sysq:138":{"kind":"question","points":1},"sysq:139":{"kind":"question","points":1},"sysq:14":{"kind":"question","points":1},"sysq:140":{"kind":"question","points":1},"sysq:141":{"kind":"question","points":1},"sysq:142":{"kind":"question","points":1},"sysq:143":{"kind":"question","points":1},"sysq:144":{"kind":"question","points":1},"sysq:145":{"kind":"question","points":1},"sysq:146":{"kind":"question","points":1},"sysq:147":{"kind":"question","points":1},"sysq:148":{"kind":"question","points":1},"sysq:149":{"kind":"question","points":1},"sysq:15":{"kind":"question","points":1},"sysq:150":{"kind":"question","points":1},"sysq:151":{"kind":"question","points":1},"sysq:152":{"kind":"question","points":1},"sysq:153":{"kind":"question","points":1},"sysq:154":{"kind":"question","points":1},"sysq:155":{"kind":"question","points":1},"sysq:156":{"kind":"question","points":1},"sysq:157":{"kind":"question","points":1},"sysq:158":{"kind":"question","points":1},"sysq:159":{"kind":"question","points":1},"sysq:16":{"kind":"question","points":1},"sysq:160":{"kind":"question","points":1},"sysq:161":{"kind":"question","points":1},"sysq:162":{"kind":"question","points":1},"sysq:163":{"kind":"question","points":1},"sysq:164":{"kind":"question","points":1},"sysq:165":{"kind":"question","points":1},"sysq:166":{"kind":"question","points":1},"sysq:167":{"kind":"question","points":1},"sysq:168":{"kind":"question","points":1},"sysq:169":{"kind":"question","points":1},"sysq:17":{"kind":"question","points":1},"sysq:170":{"kind":"question","points":1},"sysq:171":{"kind":"question","points":1},"sysq:172":{"kind":"question","points":1},"sysq:173":{"kind":"question","points":1},"sysq:174":{"kind":"question","points":1},"sysq:175":{"kind":"question","points":1},"sysq:176":{"kind":"question","points":1},"sysq:177":{"kind":"question","points":1},"sysq:178":{"kind":"question","points":1},"sysq:179":{"kind":"question","points":1},"sysq:18":{"kind":"question","points":1},"sysq:180":{"kind":"question","points":1},"sysq:181":{"kind":"question","points":1},"sysq:182":{"kind":"question","points":1},"sysq:183":{"kind":"question","points":1},"sysq:184":{"kind":"question","points":1},"sysq:19":{"kind":"question","points":1},"sysq:2":{"kind":"question","points":1},"sysq:20":{"kind":"question","points":1},"sysq:21":{"kind":"question","points":1},"sysq:22":{"kind":"question","points":1},"sysq:23":{"kind":"question","points":1},"sysq:24":{"kind":"question","points":1},"sysq:25":{"kind":"question","points":1},"sysq:26":{"kind":"question","points":1},"sysq:27":{"kind":"question","points":1},"sysq:28":{"kind":"question","points":1},"sysq:29":{"kind":"question","points":1},"sysq:3":{"kind":"question","points":1},"sysq:30":{"kind":"question","points":1},"sysq:31":{"kind":"question","points":1},"sysq:32":{"kind":"question","points":1},"sysq:33":{"kind":"question","points":1},"sysq:34":{"kind":"question","points":1},"sysq:35":{"kind":"question","points":1},"sysq:36":{"kind":"question","points":1},"sysq:37":{"kind":"question","points":1},"sysq:38":{"kind":"question","points":1},"sysq:39":{"kind":"question","points":1},"sysq:4":{"kind":"question","points":1},"sysq:40":{"kind":"question","points":1},"sysq:41":{"kind":"question","points":1},"sysq:42":{"kind":"question","points":1},"sysq:43":{"kind":"question","points":1},"sysq:44":{"kind":"question","points":1},"sysq:45":{"kind":"question","points":1},"sysq:47":{"kind":"question","points":1},"sysq:48":{"kind":"question","points":1},"sysq:49":{"kind":"question","points":1},"sysq:5":{"kind":"question","points":1},"sysq:51":{"kind":"question","points":1},"sysq:52":{"kind":"question","points":1},"sysq:53":{"kind":"question","points":1},"sysq:54":{"kind":"question","points":1},"sysq:55":{"kind":"question","points":1},"sysq:56":{"kind":"question","points":1},"sysq:57":{"kind":"question","points":1},"sysq:58":{"kind":"question","points":1},"sysq:59":{"kind":"question","points":1},"sysq:6":{"kind":"question","points":1},"sysq:60":{"kind":"question","points":1},"sysq:61":{"kind":"question","points":1},"sysq:62":{"kind":"question","points":1},"sysq:63":{"kind":"question","points":1},"sysq:64":{"kind":"question","points":1},"sysq:65":{"kind":"question","points":1},"sysq:66":{"kind":"question","points":1},"sysq:67":{"kind":"question","points":1},"sysq:68":{"kind":"question","points":1},"sysq:69":{"kind":"question","points":1},"sysq:7":{"kind":"question","points":1},"sysq:70":{"kind":"question","points":1},"sysq:71":{"kind":"question","points":1},"sysq:72":{"kind":"question","points":1},"sysq:73":{"kind":"question","points":1},"sysq:74":{"kind":"question","points":1},"sysq:75":{"kind":"question","points":1},"sysq:76":{"kind":"question","points":1},"sysq:77":{"kind":"question","points":1},"sysq:78":{"kind":"question","points":1},"sysq:79":{"kind":"question","points":1},"sysq:8":{"kind":"question","points":1},"sysq:80":{"kind":"question","points":1},"sysq:81":{"kind":"question","points":1},"sysq:82":{"kind":"question","points":1},"sysq:83":{"kind":"question","points":1},"sysq:84":{"kind":"question","points":1},"sysq:85":{"kind":"question","points":1},"sysq:86":{"kind":"question","points":1},"sysq:87":{"kind":"question","points":1},"sysq:88":{"kind":"question","points":1},"sysq:89":{"kind":"question","points":1},"sysq:9":{"kind":"question","points":1},"sysq:90":{"kind":"question","points":1},"sysq:91":{"kind":"question","points":1},"sysq:92":{"kind":"question","points":1},"sysq:93":{"kind":"question","points":1},"sysq:94":{"kind":"question","points":1},"sysq:95":{"kind":"question","points":1},"sysq:96":{"kind":"question","points":1},"sysq:97":{"kind":"question","points":1},"sysq:98":{"kind":"question","points":1},"sysq:99":{"kind":"question","points":1},"systool:appetite":{"kind":"activity","points":5},"systool:assurance":{"kind":"activity","points":5},"systool:capital":{"kind":"activity","points":5},"systool:cascade":{"kind":"activity","points":5},"systool:catalog":{"kind":"activity","points":5},"systool:channels":{"kind":"activity","points":5},"systool:commsplan":{"kind":"activity","points":5},"systool:conflict":{"kind":"activity","points":5},"systool:culsurvey":{"kind":"activity","points":5},"systool:dashboard":{"kind":"activity","points":5},"systool:delphi":{"kind":"activity","points":5},"systool:exceptions":{"kind":"activity","points":5},"systool:horizon":{"kind":"activity","points":5},"systool:iacm":{"kind":"activity","points":5},"systool:incentive":{"kind":"activity","points":5},"systool:incidents":{"kind":"activity","points":5},"systool:irr":{"kind":"activity","points":5},"systool:lessons":{"kind":"activity","points":5},"systool:mvv":{"kind":"activity","points":5},"systool:options":{"kind":"activity","points":5},"systool:pdca":{"kind":"activity","points":5},"systool:pestle":{"kind":"activity","points":5},"systool:policydoc":{"kind":"activity","points":5},"systool:porter":{"kind":"activity","points":5},"systool:process":{"kind":"activity","points":5},"systool:protocol":{"kind":"activity","points":5},"systool:quant":{"kind":"activity","points":5},"systool:rca":{"kind":"activity","points":5},"systool:regwatch":{"kind":"activity","points":5},"systool:sanction":{"kind":"activity","points":5},"systool:scenario":{"kind":"activity","points":5},"systool:sod":{"kind":"activity","points":5},"systool:speakup":{"kind":"activity","points":5},"systool:stkreg":{"kind":"activity","points":5},"systool:swot":{"kind":"activity","points":5},"systool:tone":{"kind":"activity","points":5},"systool:training":{"kind":"activity","points":5},"systool:unified":{"kind":"activity","points":5}};
  const BANK_OPTIONS = {"1":4,"2":4,"3":4,"4":4,"5":4,"6":4,"8":4,"9":4,"10":4,"11":4,"12":4,"13":4,"14":4,"15":4,"16":4,"17":4,"18":4,"19":4,"20":4,"21":4,"22":4,"23":4,"24":4,"25":4,"26":4,"27":4,"28":4,"29":4,"30":4,"31":4,"32":4,"33":4,"34":4,"35":4,"36":4,"37":4,"38":4,"39":4,"40":4,"41":4,"42":4,"43":4,"44":4,"45":4,"46":4,"47":4,"48":4,"49":4,"50":4,"51":4,"52":4,"53":4,"54":4,"55":4,"56":4,"57":4,"58":4,"59":4,"60":4,"61":4,"62":4,"63":4,"64":4,"65":2,"66":4,"67":4,"68":4,"69":2,"72":4,"75":4,"76":4,"77":4,"78":4,"79":4,"80":4,"81":4,"82":4,"83":4,"84":4,"85":4,"86":4,"87":4,"88":4,"89":4,"90":4,"91":4,"92":4,"93":4,"94":4,"95":4,"96":4,"97":4,"98":4,"100":4,"101":4,"102":4,"103":4,"104":4,"105":4,"106":4,"107":4,"108":4,"109":4,"110":4,"111":4,"112":4,"113":4,"114":4,"115":4,"116":4,"117":4,"118":4,"119":4,"120":4,"121":4,"122":4,"123":4,"124":4,"125":4,"126":4,"127":4,"128":4,"129":4,"130":4,"131":4,"132":4,"133":4,"134":4,"135":4,"137":4,"138":4,"139":4,"140":4,"141":4,"142":4,"143":4,"144":4,"145":4,"147":4,"148":4,"150":4,"152":4,"154":4,"155":4,"156":4,"158":4,"159":4,"160":4,"161":4,"162":4,"163":4,"164":4,"165":4,"166":4,"167":4,"168":4,"169":4,"170":4,"171":4,"172":4,"173":4,"174":4,"175":4,"176":4,"177":4,"178":4,"180":4,"182":4,"185":4,"186":4,"187":4,"188":4,"189":4,"190":4,"191":4,"192":4,"194":4,"195":4,"196":4,"197":4,"198":4,"199":4,"200":4,"201":4,"203":4,"1001":4,"1002":4,"1003":4,"1004":4,"1005":4,"1006":4,"1007":4,"1008":4,"1009":4,"1010":4,"1011":4,"1012":4,"1013":4,"1014":4,"1015":4,"1016":4,"1017":4,"1018":4,"1019":4,"1020":4,"1021":4,"1022":4,"1023":4,"1024":4,"1025":4,"1026":4,"1027":4,"1028":4,"1029":4,"1030":4,"1031":4,"1032":4,"1033":4,"1034":4,"1035":4,"1036":4,"1037":4,"1038":4,"1039":4,"1040":4,"1041":4,"1042":4,"1043":4,"1044":4,"1045":4,"1046":4,"1047":4,"1048":4,"1049":4,"1050":4,"1051":4,"1052":4,"1053":4,"1054":4,"1055":4,"1056":4,"1057":4,"1058":4,"1059":4,"1060":4,"1061":4,"1062":4,"1063":4,"1064":4,"1065":4,"1067":4,"1068":4,"1069":4,"1070":4,"1071":4,"1072":4,"1073":4,"1074":4,"1075":4,"1076":4,"1077":4,"1078":4,"1079":4,"1080":4,"1081":4,"1082":4,"1083":4,"1084":4,"1085":4,"1086":4,"1087":4,"1088":4,"1089":4,"1090":4,"1091":4,"1092":4,"1093":4,"1094":4,"1095":4,"1096":4,"1097":4};
  const LECTURES = {"1":[1,2,1001,3,4,1002,5,1003,11,13,1004,17,18,1005,19,20,1006,21,22,1007,23,24,1008,30,1009,72,1010],"2":[76,1011,77,78,1012,79,1013,102,103,1014,104,105,1015,106,107,1016,108,111,1017,112,113,1018,115,117,1019,118,119,1020],"3":[14,16,1031,80,1032,81,82,1033,83,84,1034,85,86,1035,87,88,1036,89,90,1037,100,101,1038,137,138,1039,139,141,1040,142,143,1041,144,145,1042,147,1043,188,189,1044,190,191,1045],"4":[8,10,1046,12,15,1047,61,62,1048,63,64,1049,65,66,1050,67,68,1051,69,75,1052,91,92,1053,93,94,1054,95,96,1055],"5":[97,98,1056,116,140,1057,148,1058,150,1059,152,1060,154,155,1061,156,1062,159,160,1063,192,1064,194,195,199],"6":[31,33,1065,37,38,39,40,1067,41,42,1068,43,44,1069,45,46,1070,47,48,1071,49,50,1072,51,52,1073,53,54,1074,55,56,1075,57,58,1076,59,60],"7":[1077,109,110,1078,114,158,1079,161,162,1080,163,164,1081,165,166,1082,169,170,1083,171,172,1084,173,174,1085,175,176,1086,177,178,180,197,200,201,203],"8":[6,9,1087,25,26,1088,27,28,1089,29,32,1090,34,35,1091,36,167,1092,168,182,1093,1094,185,186,1095,187,1096,1097],"9":[120,121,1021,122,123,1022,124,125,1023,126,127,1024,128,129,1025,130,131,1026,132,133,1027,134,135,1028,196,1029,198,1030],"10":[134,135,1028,196,1029,198,1030,189,1044,190,191,1045,192,1064,194,195,199,180,197,200,201,203,187,1096,1097]};
  const $ = selector => document.querySelector(selector);
  const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; } catch (_) { return fallback; } };
  const raw = key => { try { return localStorage.getItem(key); } catch (_) { return null; } };
  const after = fn => { const run = () => { try { fn(); } catch (_) {} }; if (typeof queueMicrotask === 'function') queueMicrotask(run); else Promise.resolve().then(run); };
  function account() {
    try {
      const c = window.TFC, u = c && c.user && c.user();
      return c && typeof c.activityReady === 'function' && c.activityReady() && typeof c.activityAccount === 'function' && u && !u.local && !u.guest && /^[0-9a-f]{16}$/.test(u.id || '') ? String(c.activityAccount() || '') : '';
    } catch (_) { return ''; }
  }
  function record(eventId, owner) {
    const id = account();
    if (!id || (owner && owner !== id) || !Object.prototype.hasOwnProperty.call(CATALOG, eventId)) return false;
    try { return window.TFC.recordActivity(eventId) === true; } catch (_) { return false; }
  }
  const bankId = id => Object.prototype.hasOwnProperty.call(BANK_OPTIONS, String(id)) ? Number(id) : null;
  const chosen = (id, value) => Number.isInteger(value) && value >= 0 && value < (BANK_OPTIONS[id] || 0);
  function question(id, owner) { if (bankId(id) !== null) return record('question:bank:' + id, owner); return false; }
  // Small public adapter contract. Native arena code uses record; other modules share
  // account/after without accessing private authentication material or reward amounts.
  window.TFActivity = Object.freeze({ version: 1, get ready() { return initialized && !!(window.TFActivitySystem && window.TFActivitySystem.ready === true); }, record, account, after, arenaRun, arenaComplete, arenaQuestion });

  function lectureCheck(button) {
    if (!button.matches('.lq-act > button.btn-e') || button.disabled) return;
    const card = button.closest('.lq-q'), list = card && card.parentElement;
    const lm = list && /^lqList(\d+)$/.exec(list.id), label = card && card.querySelector('.lq-id');
    const qm = label && /^\s*#(\d+)\b/.exec(label.textContent), owner = account();
    if (!owner || !lm || !qm) return;
    const lecture = Number(lm[1]), qid = bankId(qm[1]);
    if (qid === null || !(LECTURES[lecture] || []).includes(qid)) return;
    const key = 'grcpLQ' + lecture, before = read(key, {})[qid];
    if (!before || before.r || !chosen(qid, before.p)) return;
    after(() => {
      const result = read(key, {})[qid];
      if (result && result.r === true && result.p === before.p) question(qid, owner);
    });
  }

  let exam = null, arena = null;
  const arenaContexts = new WeakMap();
  const ARENA = { incident: 'inc', classify: 'cls', viva: 'vq', case: 'cs', lines: 'ln', order: 'od', match: 'mt', team: 'tm' };
  const RESTARTS = '#incAgain,#clsAgain,#vnext,#lnAgain,#odAgain,#mtAgain,#tmAgain';
  function invalidateOwner() {
    const owner = account();
    if (exam && exam.owner !== owner) exam = null;
    if (arena && arena.touched && arena.owner !== owner) arena.valid = false;
  }
  // Opaque, in-memory per-native-mount token. Old timers cannot finish a new
  // same-mode mount, even when both instances reuse the same #arBody element.
  function arenaRun(host, mode) {
    if (!host || !Object.prototype.hasOwnProperty.call(ARENA, mode)) return null;
    const token = { host, mode, owner: '', valid: false, touched: false, head: null };
    arenaContexts.set(host, token);
    return token;
  }
  function arenaInteraction(element) {
    const host = element.closest('#arBody'), active = host && arenaContexts.get(host);
    if (!active) return;
    if (element.closest(RESTARTS)) { active.owner = ''; active.valid = false; active.touched = false; active.head = null; arena = active; return; }
    if (!element.closest('.ar-opt,.ar-el,#vgo,#csgo,#vmic,#csmic,#va,#cs')) return;
    if (!host.querySelector('#' + ARENA[active.mode])) return;
    if (!active.touched) {
      active.owner = account(); active.valid = !!active.owner; active.touched = true; active.head = host.querySelector('.ar-head');
    }
    if (active.owner !== account()) active.valid = false;
    arena = active;
  }
  function validArena(mode, token) {
    return !!(token && token === arenaContexts.get(token.host) && token.touched && token.valid && token.mode === mode && token.host.isConnected && token.head === token.host.querySelector('.ar-head'));
  }
  function arenaComplete(mode, token) {
    if (!validArena(mode, token)) return false;
    return record('activity:arena:' + mode, token.owner);
  }
  function arenaQuestion(id, token) {
    if (!validArena('team', token)) return false;
    return question(id, token.owner);
  }
  function currentExam() {
    const run = $('#run'), ctx = window.GRCP_CTX;
    if (!run || run.style.display !== 'block' || !$('#qO') || !ctx || !ctx.q || bankId(ctx.q.id) === null) return null;
    return { id: Number(ctx.q.id), revealed: !!ctx.revealed, count: ($('#pal') || document.createElement('div')).querySelectorAll('button').length };
  }
  function beginExam() {
    const owner = account(), before = raw('grcpHist');
    exam = null;
    if (!owner) return;
    after(() => {
      const c = currentExam();
      if (c && !c.revealed && c.count > 0 && owner === account()) exam = { owner, history: before, total: c.count, selected: new Set(), finished: false };
    });
  }
  function trackExamSelection(position) {
    const before = currentExam(), owner = account(), run = exam;
    if (!owner || !before || before.revealed || !run || run.finished || run.owner !== owner || !chosen(before.id, position)) return;
    after(() => {
      const next = currentExam(), options = $('#qO') && Array.from($('#qO').querySelectorAll('.o'));
      if (exam === run && owner === account() && next && next.id === before.id && !next.revealed && options && options[position] && options[position].classList.contains('sel')) run.selected.add(before.id);
    });
  }
  function checkExam(button) {
    const c = currentExam(), owner = account();
    const selected = $('#qO') && Array.from($('#qO').querySelectorAll('.o')).findIndex(o => o.classList.contains('sel'));
    if (!owner || !c || c.revealed || button.disabled || !chosen(c.id, selected) || !exam || exam.finished || exam.owner !== owner || !exam.selected.has(c.id)) return;
    after(() => { const next = currentExam(); if (next && next.id === c.id && next.revealed) question(c.id, owner); });
  }
  function finishExam() {
    const run = exam, result = $('#res');
    if (!run || run.finished || run.owner !== account()) return;
    if (!result || result.style.display !== 'block' || !$('#run') || $('#run').style.display !== 'none') return;
    const h = read('grcpHist', [])[0];
    if (raw('grcpHist') === run.history || !h || h.n !== run.total || !['practice', 'exam'].includes(h.m) || !Number.isFinite(Date.parse(h.d))) return;
    // Native fresh history AND native result view establish final submission. Neither
    // the old aggregate history nor already-saved answers is reconstructed on boot.
    run.finished = true;
    run.selected.forEach(id => question(id, run.owner));
    const skipped = Number(($('#rSk') || {}).textContent);
    if (run.selected.size !== run.total || skipped !== 0) return;
    const key = h.exam === 0 ? 'free' : String(h.exam);
    if (['1', '2', '3', 'd1', 'd2', 'd3', 'd4', 'd5', 'free'].includes(key)) record('activity:exam:' + key, run.owner);
  }

  document.addEventListener('click', event => {
    const element = event.target && event.target.nodeType === 1 ? event.target : event.target && event.target.parentElement;
    if (!element) return;
    invalidateOwner();
    arenaInteraction(element);
    const button = element.closest('button');
    if (button && !button.disabled) {
      lectureCheck(button);
      if (button.id === 'go' && $('#setup') && $('#qO')) beginExam();
      if (button.id === 'bCheck') checkExam(button);
    }
    const option = element.closest('#qO .o');
    if (option) trackExamSelection(Array.from(option.parentElement.querySelectorAll('.o')).indexOf(option));
    after(finishExam);
  }, true);
  document.addEventListener('input', event => { invalidateOwner(); if (event.target && event.target.nodeType === 1) arenaInteraction(event.target); }, true);
  document.addEventListener('keydown', event => {
    invalidateOwner();
    if (typeof event.key !== 'string' || event.key.length !== 1) return;
    const index = 'ABCDE'.indexOf(event.key.toUpperCase());
    if (index >= 0) trackExamSelection(index);
  }, true);
  window.addEventListener('hashchange', () => { if (!/^#\/exam(?:\/|$)/.test(location.hash)) exam = null; arena = null; });
  window.addEventListener('storage', invalidateOwner);
  window.addEventListener('tfc:participation-ready', invalidateOwner);
  window.addEventListener('tfc:participation-account', invalidateOwner);
  // finish() also runs from the native timed-exam callback. Observe only DOM changes;
  // do not patch Storage, timers, native data, grading functions or route handlers.
  let pending = false;
  const observer = new MutationObserver(() => {
    invalidateOwner();
    if (!exam || exam.finished || pending) return;
    pending = true; after(() => { pending = false; finishExam(); });
  });
  observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['style'] });
  initialized = true;
})();

/* Track Ford system and study-plan participation adapter v1.
 * Emits allowlisted IDs only. Does not change native scores, state or storage.
 * Future trusted interactions only; no hydration, import, demo or history backfill.
 */
(function () {
  'use strict';
  if (window.TFActivitySystem && window.TFActivitySystem.version === 1 && window.TFActivitySystem.ready === true) return;
  const A = window.TFActivity;
  if (!A || !A.account || !A.record || !A.after) return;
  const SCHEMAS = [{"id":"pestle","fields":[{"k":"rows","t":"table","cols":[{"k":"dim","t":"select","opts":["سياسي","اقتصادي","اجتماعي","تقني","بيئي","قانوني"]},{"k":"factor","t":"text"},{"k":"impact","t":"select","opts":["منخفض","متوسط","عالٍ","حرج"]},{"k":"horizon","t":"select","opts":["فوري","6 أشهر","سنة","3 سنوات"]},{"k":"resp","t":"text"}]}]},{"id":"porter","fields":[{"k":"rows","t":"table","cols":[{"k":"force","t":"select","opts":["تهديد الداخلين الجدد","قوة تفاوض المورّدين","قوة تفاوض المشترين","تهديد البدائل","حدة المنافسة"]},{"k":"level","t":"select","opts":["منخفضة","متوسطة","عالية"]},{"k":"ev","t":"text"},{"k":"imp","t":"text"}]}]},{"id":"horizon","fields":[{"k":"rows","t":"table","cols":[{"k":"signal","t":"text"},{"k":"src","t":"select","opts":["جهة رقابية","تشريع مقترح","تقرير قطاعي","منافس","تقنية ناشئة","اتجاه اجتماعي"]},{"k":"prob","t":"select","opts":["منخفضة","متوسطة","عالية","مؤكدة"]},{"k":"lead","t":"text"},{"k":"owner","t":"text"}]}]},{"id":"regwatch","fields":[{"k":"rows","t":"table","cols":[{"k":"reg","t":"text"},{"k":"auth","t":"text"},{"k":"type","t":"select","opts":["إلزامي","طوعي","تعاقدي"]},{"k":"status","t":"select","opts":["ممتثل","ممتثل جزئياً","غير ممتثل","قيد التقييم"]},{"k":"gap","t":"text"}]}]},{"id":"swot","fields":[{"k":"s","t":"area"},{"k":"w","t":"area"},{"k":"o","t":"area"},{"k":"t","t":"area"},{"k":"so","t":"area"},{"k":"wt","t":"area"}]},{"id":"capital","fields":[{"k":"rows","t":"table","cols":[{"k":"cap","t":"select","opts":["بشري","تقني","مادي","معلوماتي","مالي"]},{"k":"state","t":"select","opts":["نقطة قوة","كافٍ","فجوة","فجوة حرجة"]},{"k":"ev","t":"text"},{"k":"act","t":"text"}]}]},{"id":"incidents","fields":[{"k":"rows","t":"table","cols":[{"k":"inc","t":"text"},{"k":"freq","t":"num"},{"k":"cause","t":"select","opts":["سوء سلوك","خطأ تنفيذ","سوء تقدير","عامل خارجي"]},{"k":"cost","t":"text"},{"k":"root","t":"select","opts":["نعم ومُغلق","نعم ومفتوح","لا"]}]}]},{"id":"process","fields":[{"k":"rows","t":"table","cols":[{"k":"proc","t":"text"},{"k":"owner","t":"text"},{"k":"crit","t":"select","opts":["منخفضة","متوسطة","عالية","حرجة"]},{"k":"auto","t":"select","opts":["يدوي بالكامل","مختلط","آلي بالكامل"]},{"k":"dep","t":"select","opts":["نعم","لا"]}]}]},{"id":"culsurvey","fields":[{"k":"scale","t":"scale","items":6}]},{"id":"tone","fields":[{"k":"rows","t":"table","cols":[{"k":"level","t":"select","opts":["المجلس","التنفيذيون","المديرون المباشرون","المشرفون"]},{"k":"beh","t":"text"},{"k":"align","t":"select","opts":["متسق","متسق جزئياً","متعارض"]},{"k":"ev","t":"text"}]}]},{"id":"speakup","fields":[{"k":"total","t":"num"},{"k":"anon","t":"num"},{"k":"sub","t":"num"},{"k":"retal","t":"num"},{"k":"interp","t":"area"}]},{"id":"stkreg","fields":[{"k":"rows","t":"table","cols":[{"k":"name","t":"text"},{"k":"type","t":"select","opts":["داخلي","خارجي","جهة رقابية","منشأة ممتدة","مجتمع"]},{"k":"exp","t":"text"},{"k":"power","t":"select","opts":["منخفضة","متوسطة","عالية"]},{"k":"interest","t":"select","opts":["منخفض","متوسط","عالٍ"]},{"k":"pr","t":"select","opts":["حرجة","عالية","متوسطة","منخفضة"]}]}]},{"id":"conflict","fields":[{"k":"rows","t":"table","cols":[{"k":"a","t":"text"},{"k":"b","t":"text"},{"k":"issue","t":"text"},{"k":"floor","t":"text"},{"k":"bal","t":"area"}]}]},{"id":"mvv","fields":[{"k":"mission","t":"area"},{"k":"vision","t":"area"},{"k":"values","t":"text"},{"k":"behaviours","t":"area"}]},{"id":"appetite","fields":[{"k":"capacity","t":"area"},{"k":"statement","t":"area"},{"k":"rows","t":"table","cols":[{"k":"cat","t":"select","opts":["استراتيجية","تشغيلية","مالية","امتثال","سمعة","سيبرانية","سلامة"]},{"k":"app","t":"select","opts":["متجنّبة","منخفضة","متوازنة","مرتفعة"]},{"k":"tol","t":"text"},{"k":"esc","t":"text"}]},{"k":"approver","t":"text"}]},{"id":"cascade","fields":[{"k":"rows","t":"table","cols":[{"k":"obj","t":"text"},{"k":"lvl","t":"select","opts":["المنشأة","وحدة أعمال","إدارة","قسم","فريق"]},{"k":"parent","t":"text"},{"k":"owner","t":"text"},{"k":"measure","t":"text"},{"k":"due","t":"text"}]}]},{"id":"unified","fields":[{"k":"rows","t":"table","cols":[{"k":"item","t":"text"},{"k":"cat","t":"select","opts":["فرصة","عقبة","التزام إلزامي","التزام طوعي"]},{"k":"obj","t":"text"},{"k":"src","t":"select","opts":["ورشة عصف","مقابلات","أسلوب دلفي","تحليل سيناريوهات","بيانات تاريخية","مسح الأفق","تدقيق"]},{"k":"owner","t":"text"}]}]},{"id":"delphi","fields":[{"k":"question","t":"area"},{"k":"rows","t":"table","cols":[{"k":"round","t":"select","opts":["الأولى","الثانية","الثالثة"]},{"k":"view","t":"text"},{"k":"conv","t":"select","opts":["متباعد","متقارب","شبه إجماع"]}]},{"k":"concl","t":"area"}]},{"id":"scenario","fields":[{"k":"rows","t":"table","cols":[{"k":"name","t":"select","opts":["الأفضل","الأرجح","الأسوأ","صدمة"]},{"k":"assume","t":"text"},{"k":"impact","t":"text"},{"k":"trigger","t":"text"},{"k":"resp","t":"text"}]}]},{"id":"irr","fields":[{"k":"rows","t":"table","cols":[{"k":"item","t":"text"},{"k":"lk","t":"select","opts":["نادرة","منخفضة","متوسطة","مرجّحة","شبه مؤكدة"]},{"k":"im","t":"select","opts":["ضئيل","منخفض","متوسط","كبير","كارثي"]},{"k":"inh","t":"select","opts":["منخفضة","متوسطة","عالية","حرجة"]},{"k":"res","t":"select","opts":["منخفضة","متوسطة","عالية","حرجة"]},{"k":"wt","t":"select","opts":["نعم","لا"]},{"k":"sec","t":"text"}]}]},{"id":"quant","fields":[{"k":"rows","t":"table","cols":[{"k":"item","t":"text"},{"k":"p","t":"num"},{"k":"loss","t":"num"},{"k":"emv","t":"calc"},{"k":"ctrl","t":"num"},{"k":"net","t":"calc"}]}]},{"id":"options","fields":[{"k":"rows","t":"table","cols":[{"k":"item","t":"text"},{"k":"opt","t":"select","opts":["التجنّب","القبول","النقل","التخفيف"]},{"k":"just","t":"text"},{"k":"cost","t":"text"},{"k":"sec","t":"text"}]}]},{"id":"iacm","fields":[{"k":"rows","t":"table","cols":[{"k":"ctrl","t":"text"},{"k":"type","t":"select","opts":["استباقي (وقائي)","كشفي","استجابي"]},{"k":"nature","t":"select","opts":["يدوي","آلي","مختلط"]},{"k":"level","t":"select","opts":["المنشأة","العملية","المعاملة"]},{"k":"serves","t":"text"},{"k":"owner","t":"text"}]}]},{"id":"catalog","fields":[{"k":"rows","t":"table","cols":[{"k":"ctrl","t":"text"},{"k":"status","t":"select","opts":["لم يبدأ","قيد التنفيذ","مطبَّق","مطبَّق ومختبَر"]},{"k":"ev","t":"text"},{"k":"freq","t":"select","opts":["مستمر","يومي","أسبوعي","شهري","ربع سنوي","سنوي"]},{"k":"last","t":"date"}]}]},{"id":"sod","fields":[{"k":"rows","t":"table","cols":[{"k":"proc","t":"text"},{"k":"init","t":"text"},{"k":"appr","t":"text"},{"k":"exec","t":"text"},{"k":"rev","t":"text"},{"k":"conf","t":"select","opts":["لا","نعم — يحتاج معالجة"]}]}]},{"id":"policydoc","fields":[{"k":"title","t":"text"},{"k":"code","t":"text"},{"k":"purpose","t":"area"},{"k":"scope","t":"area"},{"k":"refs","t":"area"},{"k":"defs","t":"area"},{"k":"statements","t":"area"},{"k":"roles","t":"area"},{"k":"controls","t":"area"},{"k":"exceptions","t":"area"},{"k":"breach","t":"area"},{"k":"measure","t":"area"},{"k":"owner","t":"text"},{"k":"approver","t":"text"},{"k":"review","t":"date"}]},{"id":"exceptions","fields":[{"k":"rows","t":"table","cols":[{"k":"pol","t":"text"},{"k":"req","t":"text"},{"k":"just","t":"text"},{"k":"comp","t":"text"},{"k":"appr","t":"text"},{"k":"exp","t":"date"}]}]},{"id":"commsplan","fields":[{"k":"rows","t":"table","cols":[{"k":"aud","t":"text"},{"k":"msg","t":"text"},{"k":"chan","t":"select","opts":["اجتماع","بريد","بوابة داخلية","ورشة","تقرير للمجلس","تدريب"]},{"k":"freq","t":"select","opts":["فوري","أسبوعي","شهري","ربع سنوي","سنوي"]},{"k":"dir","t":"select","opts":["نازل","صاعد","أفقي"]},{"k":"owner","t":"text"}]}]},{"id":"training","fields":[{"k":"rows","t":"table","cols":[{"k":"role","t":"text"},{"k":"risk","t":"select","opts":["منخفض","متوسط","عالٍ","حرج"]},{"k":"topic","t":"text"},{"k":"mode","t":"select","opts":["حضوري","إلكتروني","محاكاة","تدريب عملي"]},{"k":"measure","t":"text"},{"k":"ext","t":"select","opts":["نعم","لا"]}]}]},{"id":"incentive","fields":[{"k":"rows","t":"table","cols":[{"k":"role","t":"text"},{"k":"base","t":"text"},{"k":"cond","t":"text"},{"k":"pct","t":"num"},{"k":"wd","t":"select","opts":["نعم","لا"]},{"k":"risk","t":"text"}]}]},{"id":"channels","fields":[{"k":"rows","t":"table","cols":[{"k":"chan","t":"text"},{"k":"anon","t":"select","opts":["نعم","لا","يمنعها القانون"]},{"k":"mgr","t":"select","opts":["طرف محايد خارجي","التدقيق الداخلي","الأخلاقيات","الموارد البشرية","الإدارة المباشرة"]},{"k":"ack","t":"text"},{"k":"ret","t":"select","opts":["مكتوبة ومُطبَّقة ومُختبَرة","مكتوبة غير مُختبَرة","غير موجودة"]}]}]},{"id":"protocol","fields":[{"k":"steps","t":"area"},{"k":"inv","t":"text"},{"k":"evid","t":"area"},{"k":"conf","t":"area"},{"k":"sla","t":"text"}]},{"id":"sanction","fields":[{"k":"rows","t":"table","cols":[{"k":"viol","t":"text"},{"k":"sev","t":"select","opts":["بسيطة","متوسطة","جسيمة","جسيمة جداً"]},{"k":"first","t":"text"},{"k":"repeat","t":"text"},{"k":"notify","t":"select","opts":["نعم","لا","حسب الحالة"]}]}]},{"id":"rca","fields":[{"k":"event","t":"text"},{"k":"symptom","t":"text"},{"k":"w1","t":"text"},{"k":"w2","t":"text"},{"k":"w3","t":"text"},{"k":"w4","t":"text"},{"k":"w5","t":"text"},{"k":"change","t":"area"}]},{"id":"dashboard","fields":[{"k":"rows","t":"table","cols":[{"k":"ind","t":"text"},{"k":"type","t":"select","opts":["KPI","KRI","KCI"]},{"k":"lead","t":"select","opts":["متقدّم","متأخر"]},{"k":"obj","t":"text"},{"k":"target","t":"text"},{"k":"thr","t":"text"},{"k":"freq","t":"select","opts":["أسبوعي","شهري","ربع سنوي","سنوي"]}]}]},{"id":"assurance","fields":[{"k":"rows","t":"table","cols":[{"k":"subj","t":"text"},{"k":"prov","t":"text"},{"k":"line","t":"select","opts":["الأول","الثاني","الثالث","خارجي"]},{"k":"obj","t":"select","opts":["نعم","لا"]},{"k":"comp","t":"select","opts":["نعم","لا"]},{"k":"lvl","t":"calc"},{"k":"freq","t":"select","opts":["سنوي","نصف سنوي","ربع سنوي","عند الحاجة"]}]}]},{"id":"lessons","fields":[{"k":"rows","t":"table","cols":[{"k":"src","t":"select","opts":["حادث","تدقيق","مؤشر تجاوز عتبة","شكوى","مراجعة دورية"]},{"k":"finding","t":"text"},{"k":"root","t":"text"},{"k":"fb","t":"select","opts":["الدراسة","المواءمة","التنفيذ","المراجعة"]},{"k":"change","t":"text"},{"k":"owner","t":"text"},{"k":"status","t":"select","opts":["مفتوح","قيد التنفيذ","مُغلق"]}]}]},{"id":"pdca","fields":[{"k":"plan","t":"area"},{"k":"do","t":"area"},{"k":"check","t":"area"},{"k":"act","t":"area"}]}];
  const QUESTIONS = new Set([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,47,48,49,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184]);
  const schemas = new Map(SCHEMAS.map(s => [s.id, s]));
  const $ = s => document.querySelector(s);
  const own = (o, k) => o != null && Object.prototype.hasOwnProperty.call(o, k);
  const read = (key, fallback) => { try { const v = JSON.parse(localStorage.getItem(key) || 'null'); return v == null ? fallback : v; } catch (_) { return fallback; } };
  const after = A.after;
  let identity = '', exam = null, toolEdit = null, values = new WeakMap(), observedForm = null;
  function owner() {
    const next = A.account();
    if (next !== identity) { identity = next; exam = null; toolEdit = null; values = new WeakMap(); }
    return next;
  }
  function emit(id, who) { return !!who && owner() === who && A.record(id, who); }
  function target(e) { return e.target && (e.target.nodeType === 1 ? e.target : e.target.parentElement); }

  // EXAM's answer/session functions are private. Match its exact displayed source
  // question AND all original-index options; Arabic stems 11/107 are identical.
  function currentQuestion() {
    const box = $('#app .ex-q'), bank = window.QBANK;
    if (!box || !bank || !Array.isArray(bank.q)) return null;
    const stem = box.querySelector('.ex-stem'), buttons = Array.from(box.querySelectorAll('.ex-o[data-pick]'));
    if (!stem || !buttons.length) return null;
    const shown = [];
    for (const b of buttons) {
      if (!/^\d+$/.test(b.dataset.pick || '')) return null;
      const index = Number(b.dataset.pick), text = b.querySelector('.t');
      if (!text || own(shown, index)) return null;
      const copy = text.cloneNode(true); copy.querySelectorAll('.o-alt').forEach(x => x.remove());
      shown[index] = copy.textContent.trim();
    }
    const matches = [];
    QUESTIONS.forEach(id => {
      const q = bank.q[id];
      if (!q || !Array.isArray(q.oe) || q.oe.length !== buttons.length || shown.length !== q.oe.length) return;
      for (const lang of ['ar', 'en']) {
        if (stem.textContent !== (lang === 'ar' ? q.qa : q.qe)) continue;
        if (q.oe.every((en, i) => own(shown, i) && shown[i] === String(lang === 'ar' ? ((q.oa || [])[i] || en) : en).trim())) { matches.push(id); break; }
      }
    });
    if (matches.length !== 1) return null;
    return { id: matches[0], box, buttons, revealed: !!box.querySelector('.ex-rev') };
  }
  function historyList(key) { const h = read('alsaeedExam_v1', {}); return h && Array.isArray(h[key]) ? h[key] : []; }
  function beginExam(button) {
    const previous = exam, who = owner();
    exam = null;
    if (!who) return;
    const kind = button.id === 'exRetry' ? previous && previous.kind : button.dataset.ex;
    const chapter = button.id === 'exRetry' ? previous && previous.chapter : button.dataset.ch;
    const bank = window.QBANK;
    if (!bank || !['full', 'sep'].includes(kind) || typeof chapter !== 'string') return;
    const ids = kind === 'full' ? Object.keys((window.EXAM || {}).CH || {}).flatMap(k => (bank.full || {})[k] || []) : (bank.sep || {})[chapter];
    if (!Array.isArray(ids) || !ids.length || ids.some(id => !QUESTIONS.has(id))) return;
    const key = kind + '|' + chapter, before = JSON.stringify(historyList(key)), started = Date.now();
    after(() => {
      const q = currentQuestion(), count = ($('#app .ex-cnt') || {}).textContent || '';
      if (owner() !== who || !q || q.revealed || count.trim() !== '1 / ' + ids.length || !ids.includes(q.id)) return;
      exam = { owner: who, kind, chapter, key, ids: new Set(ids), total: ids.length, before, started, selected: new Set(), checked: new Set(), finished: false };
    });
  }
  function selectQuestion(button) {
    const who = owner(), run = exam, q = currentQuestion(), pick = Number(button.dataset.pick);
    if (!who || !run || run.finished || run.owner !== who || !q || q.revealed || !run.ids.has(q.id) || !q.buttons.includes(button) || button.disabled) return;
    after(() => {
      const next = currentQuestion();
      if (owner() !== who || exam !== run || !next || next.id !== q.id || next.revealed) return;
      const selected = next.buttons.find(b => Number(b.dataset.pick) === pick);
      if (selected && !selected.disabled && selected.classList.contains('on')) run.selected.add(q.id);
    });
  }
  function revealQuestion() {
    const who = owner(), run = exam, q = currentQuestion();
    if (!who || !run || run.finished || run.owner !== who || !q || q.revealed || !run.selected.has(q.id) || !q.buttons.some(b => b.classList.contains('on'))) return;
    after(() => {
      const next = currentQuestion();
      if (owner() !== who || exam !== run || !next || next.id !== q.id || !next.revealed || !next.buttons.every(b => b.disabled)) return;
      if (!run.checked.has(q.id) && emit('sysq:' + q.id, who)) run.checked.add(q.id);
    });
  }
  function finishExam() {
    const who = owner(), run = exam;
    if (!run || run.finished || run.owner !== who) return;
    if (!$('#app .ex-res')) {
      // Leaving the private session, including EXAM.open(), invalidates staging.
      if (!$('#app .ex-q')) exam = null;
      return;
    }
    const list = historyList(run.key), previous = JSON.parse(run.before), first = list[0];
    if (!first || JSON.stringify(list) === run.before || list.length !== Math.min(20, previous.length + 1)) return;
    if (JSON.stringify(list.slice(1)) !== JSON.stringify(previous.slice(0, 19))) return;
    if (first.n !== run.total || !Number.isFinite(Date.parse(first.d)) || Date.parse(first.d) < run.started || !Number.isInteger(first.ok) || first.ok < 0 || first.ok > first.n) return;
    run.finished = true;
    run.selected.forEach(id => { if (!run.checked.has(id) && emit('sysq:' + id, run.owner)) run.checked.add(id); });
  }

  // The native Save/Approve has no completeness rules. These conservative rules
  // qualify participation only, without modifying or blocking its native save.
  function nonblank(v) { return (typeof v === 'string' && v.trim() !== '') || (typeof v === 'number' && Number.isFinite(v)); }
  function validValue(f, v) {
    if (f.t === 'num') return nonblank(v) && Number.isFinite(Number(v));
    if (f.t === 'date') {
      if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
      const d = new Date(v + 'T00:00:00Z'); return Number.isFinite(d.getTime()) && d.toISOString().slice(0, 10) === v;
    }
    if (f.t === 'select') return typeof v === 'string' && (f.opts || []).includes(v);
    return typeof v === 'string' && v.trim() !== '';
  }
  function validated(schema, data) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
    const result = {};
    for (const f of schema.fields) {
      if (!own(data, f.k)) return null;
      const v = data[f.k];
      if (f.t === 'table') {
        if (!Array.isArray(v)) return null;
        const columns = f.cols.filter(c => c.t !== 'calc'), rows = [];
        for (const row of v) {
          if (!row || typeof row !== 'object' || Array.isArray(row)) return null;
          if (!columns.some(c => nonblank(row[c.k]))) continue;
          const clean = {};
          for (const c of columns) { if (!own(row, c.k) || !validValue(c, row[c.k])) return null; clean[c.k] = row[c.k]; }
          rows.push(clean);
        }
        if (!rows.length) return null;
        result[f.k] = rows;
      } else if (f.t === 'scale') {
        if (!v || typeof v !== 'object' || Array.isArray(v)) return null;
        const scale = {};
        for (let i = 0; i < f.items; i++) { if (!own(v, i) || !Number.isInteger(v[i]) || v[i] < 0 || v[i] > 4) return null; scale[i] = v[i]; }
        result[f.k] = scale;
      } else { if (!validValue(f, v)) return null; result[f.k] = v; }
    }
    return JSON.stringify(result);
  }
  function toolContext() {
    try {
      const app = window.GRCAPP, state = app && app.ST(), form = $('#app #form');
      if (!state || !form || typeof state.step !== 'string' || !state.step.startsWith('tool:')) return null;
      const id = state.step.slice(5), schema = schemas.get(id), native = (window.GRC_TOOLS || []).find(t => t.id === id);
      if (!schema || !native) return null;
      const workspace = window.WS && window.WS.current ? window.WS.current() : '';
      return { app, state, form, id, schema, native, workspace, provenance: JSON.stringify([workspace, (state._aiGen || {})[id] || []]) };
    } catch (_) { return null; }
  }
  function sameTool(a, b) { return !!a && !!b && a.id === b.id && a.state === b.state && a.form === b.form && a.provenance === b.provenance; }
  function control(el, ctx) { return !!ctx && ctx.form.contains(el) && el.matches('input[data-f],textarea[data-f],select[data-f],input[data-c],textarea[data-c],select[data-c]') && !el.disabled && !el.readOnly; }
  function rememberControl(el) {
    const who = owner(), ctx = toolContext();
    if (control(el, ctx)) values.set(el, { value: el.value, owner: who, ctx });
  }
  function editControl(el) {
    const who = owner(), ctx = toolContext(), previous = values.get(el);
    if (!who || !control(el, ctx)) return;
    if (previous && previous.owner === who && sameTool(previous.ctx, ctx) && previous.value !== el.value) toolEdit = { owner: who, ctx };
    values.set(el, { value: el.value, owner: who, ctx });
  }
  function editScale(button) {
    const who = owner(), ctx = toolContext(), wrap = button.closest('.scale-w');
    if (!who || !ctx || !wrap || !ctx.form.contains(button)) return;
    const f = ctx.schema.fields.find(f => f.t === 'scale' && f.k === wrap.dataset.scale), i = Number(button.dataset.si), value = Number(button.dataset.sv);
    if (!f || !/^\d+$/.test(button.dataset.si || '') || !Number.isInteger(i) || i < 0 || i >= f.items || !/^[0-4]$/.test(button.dataset.sv || '')) return;
    const old = ((ctx.state.tools[ctx.id] || {})[f.k] || {})[i];
    after(() => {
      if (owner() !== who || !sameTool(ctx, toolContext()) || old === value) return;
      if (((ctx.state.tools[ctx.id] || {})[f.k] || {})[i] === value && button.classList.contains('on')) toolEdit = { owner: who, ctx };
    });
  }
  function saveTool() {
    const who = owner(), ctx = toolContext(), edit = toolEdit;
    if (!who || !ctx || !edit || edit.owner !== who || !sameTool(edit.ctx, ctx)) return;
    let snapshot; try { snapshot = validated(ctx.schema, ctx.app.readForm()); } catch (_) { return; }
    if (!snapshot) return;
    const previous = ctx.state.tools[ctx.id];
    after(() => {
      if (owner() !== who || !sameTool(ctx, toolContext()) || toolEdit !== edit) return;
      const saved = ctx.state.tools[ctx.id];
      if (saved === previous || validated(ctx.schema, saved) !== snapshot) return;
      const persisted = read('alsaeedGRC_v1', null);
      const hasReceipt = state => state && validated(ctx.schema, (state.tools || {})[ctx.id]) === snapshot
        && Array.isArray((state.selected || {})[ctx.native.el]) && state.selected[ctx.native.el].includes(ctx.id)
        && (!ctx.native.feeds || validated(ctx.schema, (state.outputs || {})[ctx.native.feeds]) === snapshot);
      if (!hasReceipt(persisted)) return;
      if (ctx.workspace) {
        try { if (!window.WS || !window.WS.loadState || !hasReceipt(window.WS.loadState(ctx.workspace))) return; } catch (_) { return; }
      }
      toolEdit = null;
      emit('systool:' + ctx.id, who);
    });
  }
  function checkPlan(task) {
    const who = owner(), key = task.dataset.k;
    if (!who || !/^#\/plan(?:\/|$)/.test(location.hash) || !/^(?:[1-9]|1[0-4])\.[0-3]$/.test(key || '') || task.classList.contains('on')) return;
    const [day, index] = key.split('.').map(Number), source = (window.GRCP_PLAN || []).find(d => d.d === day);
    if (!source || !Array.isArray(source.k) || !source.k[index] || read('grcpPlan', {})[key]) return;
    after(() => {
      const updated = $('#days .task[data-k="' + key + '"]');
      if (owner() === who && /^#\/plan(?:\/|$)/.test(location.hash) && read('grcpPlan', {})[key] === 1 && updated && updated.classList.contains('on')) emit('plan:' + key, who);
    });
  }

  // Only trusted browser actions create evidence. No public synthetic bypass.
  document.addEventListener('click', e => {
    const el = target(e), who = owner();
    if (!el) return;
    const button = el.closest('button');
    if (button && (button.id === 'aiGen' || button.id === 'exHome' || button.matches('[data-nav],[data-go]'))) {
      if (button.id === 'aiGen') toolEdit = null;
      if (button.id === 'exHome' || button.matches('[data-nav],[data-go]')) exam = null;
    }
    if (!e.isTrusted || !who) return;
    if (button && !button.disabled) {
      if (button.matches('#app [data-ex],#app #exRetry')) beginExam(button);
      if (button.matches('#app .ex-q .ex-o[data-pick]')) selectQuestion(button);
      if (button.id === 'qReveal') revealQuestion();
      if (button.matches('#app #form [data-si][data-sv]')) editScale(button);
      if (button.matches('#app #saveTool')) saveTool();
    }
    const task = el.closest('#days .task[data-k]'); if (task) checkPlan(task);
    after(finishExam);
  }, true);
  ['focusin', 'pointerdown', 'keydown', 'beforeinput'].forEach(type => document.addEventListener(type, e => {
    owner(); const el = target(e); if (el && e.isTrusted) rememberControl(el);
  }, true));
  ['input', 'change'].forEach(type => document.addEventListener(type, e => {
    owner(); const el = target(e); if (!el) return;
    if (e.isTrusted) editControl(el); else { rememberControl(el); toolEdit = null; }
  }, true));
  function accountChanged() { identity = ''; exam = null; toolEdit = null; values = new WeakMap(); owner(); }
  window.addEventListener('tfc:participation-account', accountChanged);
  window.addEventListener('storage', () => { owner(); toolEdit = null; });
  window.addEventListener('hashchange', () => { owner(); exam = null; toolEdit = null; });
  window.addEventListener('pagehide', accountChanged);
  function seedControls() {
    owner(); const ctx = toolContext(), form = ctx && ctx.form;
    if (form !== observedForm) { observedForm = form; toolEdit = null; }
    if (ctx && toolEdit && !sameTool(toolEdit.ctx, ctx)) toolEdit = null;
    if (form) form.querySelectorAll('input,textarea,select').forEach(el => { if (!values.has(el)) rememberControl(el); });
  }
  let pending = false;
  const observer = new MutationObserver(changes => {
    if (toolEdit && changes.some(c => c.type === 'childList' && toolEdit.ctx.form.contains(c.target))) toolEdit = null;
    if (pending) return;
    pending = true;
    after(() => { pending = false; seedControls(); finishExam(); });
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
  seedControls();
  window.TFActivitySystem = Object.freeze({ version: 1, ready: true });
})();
