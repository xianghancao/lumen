# jupyterlab-kuusi

JupyterLab extension: open `.ipynb` notebooks in the **Kuusi Mind Map** view using native Jupyter cell renderers.

See the [repository README](../../README.md) for installation, requirements, and usage.

## Install

From the repository root (after cloning):

```bash
npm run jlab:install
jupyter lab
```

Or set explicit paths:

```bash
KUUSI_PYTHON=/path/to/python KUUSI_JUPYTER=/path/to/jupyter npm run jlab:install
```

Open a notebook → toolbar **Kuusi** button, or **Open With → Kuusi Mind Map**.
