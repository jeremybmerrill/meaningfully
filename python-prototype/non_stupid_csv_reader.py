from typing import Any, Optional, Dict, List
from fsspec import AbstractFileSystem
from pathlib import Path

import pandas as pd
from llama_index.core.readers.base import BaseReader
from llama_index.core.schema import Document

class NonStupidCSVReader(BaseReader):
    r"""Pandas-based CSV parser.

    Parses CSVs using the separator detection from Pandas `read_csv`function.
    If special parameters are required, use the `pandas_config` dict.

    Args:
        text_column_name: the CSV column containing the text to be embedded 
        
        pandas_config (dict): Options for the `pandas.read_csv` function call.
            Refer to https://pandas.pydata.org/docs/reference/api/pandas.read_csv.html
            for more information.
            Set to empty dict by default, this means pandas will try to figure
            out the separators, table head, etc. on its own.

    """

    def __init__(
        self,
        *args: Any,
        pandas_config: dict = {},
        **kwargs: Any
    ) -> None:
        """Init params."""
        super(BaseReader, self).__init__(*args, **kwargs)
        self._pandas_config = pandas_config

    def load_data(
        self,
        file: Path,
        text_column_name: str,
        extra_info: Optional[Dict] = None,
        fs: Optional[AbstractFileSystem] = None,
    ) -> List[Document]:
        """Parse file."""
        if fs:
            with fs.open(file) as f:
                df = pd.read_csv(f, **self._pandas_config)
        else:
            df = pd.read_csv(file, **self._pandas_config)

        df.fillna('', inplace=True) # Postgres chokes on NaNs in metadata.

        return [
            Document(text=row[text_column_name], metadata=row[[col for col in df.columns if col != text_column_name]].to_dict() or {}) for _, row in df.iterrows()
        ]
