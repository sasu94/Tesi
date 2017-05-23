var connection = require('./Connection');


module.exports = {
    loadSubjects: function (cb) {
        connection.getConnection(function (err, conn) {
            conn.query('select * from Subject', function (error, results) {
                if (results.length >= 1) {
                    cb(results);
                }
            });
        })
    },

    loadProj: function (id, cb) {
        connection.getConnection(function (err, conn) {
            conn.query('select * from Project where User=?',id, function (error, results) {
                if (results.length >= 1) {
                    cb(results);
                } 
            });
        })
    },

    newFile: function (name,proj, id) {
        connection.getConnection(function (err, conn) {
            conn.query('insert into Sample (Name,Project) values (?,?)',[name,proj], function (error, results) {
               id(results.insertId);
            });
        })
    },
    newVariation: function (file, subject, sample) {
        connection.getConnection(function (err, conn) {
            if (err) throw err;
            conn.query('insert into Variation (`Subject`, `Chr`,`Start`,`End`,`Ref`,`Alt`,`Func.refgene`,`Gene.refgene`,`Gene.Detail.refgene`,`ExonicFunc.refgene`,`AAChange.refgene`,`1000G_ALL`,`1000G_AFR`,`1000G_AMR`,`1000G_EAS`,`1000G_EUR`,`1000G_SAS` ,`ExAC_Freq` ,`ExAC_AFR` ,`ExAC_AMR` ,`ExAC_EAS` ,`ExAC_FIN`,`ExAC_NFE` ,`ExAC_OTH` ,`ExAC_SAS` ,`ESP6500si_ALL` ,`ESP6500si_AA` ,`ESP6500si_EA` ,`CG46` ,`NCI60` ,`dbSNP`,`COSMIC_ID` ,`COSMIC_DIS` ,`ClinVar_SIG` ,`ClinVar_DIS` ,`ClinVar_STATUS` ,`ClinVar_ID` ,`ClinVar_DB` ,`ClinVar_DBID` ,`GWAS_DIS` ,`GWAS_OR` ,`GWAS_BETA` ,`GWAS_PUBMED` ,`GWAS_SNP` ,`GWAS_P` ,`SIFT_score` ,`SIFT_pred` ,`Polyphen2_HDIV_score` ,`Polyphen2_HDIV_pred` ,`Polyphen2_HVAR_score` ,`Polyphen2_HVAR_pred` ,`LRT_score` ,`LRT_pred` ,`MutationTaster_score` ,`MutationTaster_pred` ,`MutationAssessor_score` ,`MutationAssessor_pred` ,`FATHMM_score` ,`FATHMM_pred` ,`RadialSVM_score` ,`RadialSVM_pred` ,`LR_score` ,`LR_pred` ,`VEST3_score` ,`CADD_raw` ,`CADD_phred` ,`GERP++_RS` ,`phyloP46way_placental` ,`phyloP100way_vertebrate` ,`SiPhy_29way_logOdds` ,`Status` ,`Qual` ,`Depth` ,`Sample`) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',[subject, file[0], file[1], file[2], file[3], file[4], file[5], file[6], file[7], file[8], file[9], file[10], file[11], file[12], file[13], file[14], file[15], file[16], file[17], file[18], file[19], file[20], file[21], file[22], file[23], file[24], file[25], file[26], file[27], file[28], file[29], file[30], file[31], file[32], file[33], file[34], file[35], file[36], file[37], file[38], file[39], file[40], file[41], file[42], file[43], file[44], file[45], file[46], file[47], file[48], file[49], file[50], file[51], file[52], file[53], file[54], file[55], file[56], file[57], file[58], file[59], file[60], file[61], file[62], file[63], file[64], file[65], file[66], file[67], file[68], file[69], file[70], file[71],sample], function (error, results) {
                if (error) throw error;
                console.log(results.insertId);               
            });
            conn.release();
        })
        
    }
};