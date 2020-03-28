import pandas as pd 
import json 

a = pd.read_csv('./data/Risk_matrix_new_scaleup_0320.csv')
with open('./data/risk_scaleup_0323.js', 'w+') as fw:
    fw.write('var transRisk = [')
    for i in range(236):
        string = '['
        for j in range(236):
            string += str(a[str(j)].iloc[i])+','
#         print(string[:-1]+'],')
        fw.write(string[:-1]+'],\n')
    fw.write(']')