import os
import pandas as pd

data_path = os.path.join(os.path.dirname(__file__), '../model_data')
df = pd.read_excel(os.path.join(data_path, 'TrainingData_clean_de.xlsx'))

# import CATEGORY_NAMES from Excel Data Sheet
CATEGORY_NAMES = list(set(df['Effekt']))
