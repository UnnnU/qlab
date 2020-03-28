import pandas as pd
import json
from config import args

def ChangeFileType(path, filename):
    '''
    params: 
        path: file path eg. './data/03-20/'
        filename: eg. 'global_confirm_cn.csv'
    return:
        None
        Transform .xlsx files to .csv file under input path
    For:
        Global Data
    '''
    tmpXslx = pd.read_excel(path + filename)
    pat_en = {}
    Days = 57#3月17日
    Cols = tmpXslx.columns[1:]
    for i in range(args.countryNumber):
        if args.transDict.get(i, -1) >= 0:
            pat_en[args.countryName_en[i]] = list(tmpXslx[Cols].iloc[args.transDict[i]])
        else:
            pat_en[args.countryName_en[i]] = [0]*Days
    tmpDF = pd.DataFrame(pat_en).T
    tmpDF.to_csv(path+filename[:-4]+'csv')
    

def LoadConfirmedData(path, filename):
    '''
    params: 
        path: file path eg. './data/03-20/'
        filename: eg. 'global_confirm_cn.csv'
    return:
        None
        dump two json files under input path, -- patient_confirmed_cn.json -- and -- patient_confirmed_en.json --
    For:
        Global Data
    '''
    tmpDF = pd.read_csv(path+filename)
    pat_c_cn = {}
    pat_c_en = {}
    for i in range(args.countryNumber):
        pat_c_cn[args.countryName_cn[i]] = list(tmpDF.iloc[i])
        pat_c_en[args.countryName_en[i]] = list(tmpDF.iloc[i])
    with open(path+'patient_confirmed_cn.json', 'w+', encoding='utf-8') as json_file:
        json.dump(pat_cn, json_file, ensure_ascii=False)
    with open(path+'patient_confirmed_en.json', 'w+', encoding='utf-8') as json_file:
        json.dump(pat_en, json_file, ensure_ascii=False)
     
    
def LoadDeathData(path, filename):
    '''
    params: 
        path: file path eg. './data/03-20/'
        filename: eg. 'global_death_cn.csv'
    return:
        None
        dump two json files under input path, -- patient_death_cn.json -- and -- patient_death_en.json --
    For:
        Global Data
    '''
    tmpDF = pd.read_csv(path+filename)
    pat_c_cn = {}
    pat_c_en = {}
    for i in range(args.countryNumber):
        pat_c_cn[args.countryName_cn[i]] = list(tmpDF.iloc[i])
        pat_c_en[args.countryName_en[i]] = list(tmpDF.iloc[i])
    with open(path+'patient_death_cn.json', 'w+', encoding='utf-8') as json_file:
        json.dump(pat_cn, json_file, ensure_ascii=False)
    with open(path+'patient_death_en.json', 'w+', encoding='utf-8') as json_file:
        json.dump(pat_en, json_file, ensure_ascii=False)
        
def LoadRecoveredData(path, filename):
    '''
    params: 
        path: file path eg. './data/03-20/'
        filename: eg. 'global_recovered_cn.csv'
    return:
        None
        dump two json files under input path, -- patient_recovered_cn.json -- and -- patient_recovered_en.json --
    For:
        Global Data
    '''
    tmpDF = pd.read_csv(path+filename)
    pat_c_cn = {}
    pat_c_en = {}
    for i in range(args.countryNumber):
        pat_c_cn[args.countryName_cn[i]] = list(tmpDF.iloc[i])
        pat_c_en[args.countryName_en[i]] = list(tmpDF.iloc[i])
    with open(path+'patient_recovered_cn.json', 'w+', encoding='utf-8') as json_file:
        json.dump(pat_cn, json_file, ensure_ascii=False)
    with open(path+'patient_recovered_en.json', 'w+', encoding='utf-8') as json_file:
        json.dump(pat_en, json_file, ensure_ascii=False)

def CalculateTotalNumber(path, Date):
    '''
    params: 
        path: file path eg. './data/03-20/'
        filename: eg. 'global_recovered_cn.csv'
        Data: eg. '03-20'
    return:
        None
        dump two js files under input path, eg. -- china_patient.js -- and -- global_patient.js --
    For:
        Both Global and China Data
    '''
    # global data
    gConf = pd.read_excel(path + 'global_data_confirmed_'+Date+'.xlsx')
    gDead = pd.read_excel(path + 'global_data_death_'+Date+'.xlsx')
    gRecr = pd.read_excel(path + 'global_data_recovered_'+Date+'.xlsx')
    # china data
    cConf = pd.read_excel(path + 'china_data_confirmed_'+Date+'.xlsx')
    cDead = pd.read_excel(path + 'china_data_death_'+Date+'.xlsx')
    cRecr = pd.read_excel(path + 'china_data_recovered_'+Date+'.xlsx')
    # write file
    with open(path+'patient_'+Date+'.js', 'w+') as f:
        f.write('var global_patient_confirmed = {};\n'.format(gConf[gConf.columns[-1]].sum()))
        f.write('var global_patient_death = {};\n'.format(gDead[gDead.columns[-1]].sum()))
        f.write('var global_patient_recovered = {};\n'.format(gRecr[gRecr.columns[-1]].sum()))
        f.write('var china_patient_confirmed = {};\n'.format(cConf[cConf.columns[-1]].sum()))
        f.write('var china_patient_death = {};\n'.format(cDead[cDead.columns[-1]].sum()))
        f.write('var china_patient_recovered = {};\n'.format(cRecr[cRecr.columns[-1]].sum()))

 
        
        
        
        
        
        
        