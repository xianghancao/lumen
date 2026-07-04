# jupyterlab-lumen

JupyterLab extension: open `.ipynb` notebooks in the **Lumen Mind Map** view using native Jupyter cell renderers.

See the [repository README](../../README.md) for installation, requirements, and usage.

## Install

From the repository root (after cloning):

```bash
npm run jlab:install
jupyter lab
```

Or set explicit paths:

```bash
LUMEN_PYTHON=/path/to/python LUMEN_JUPYTER=/path/to/jupyter npm run jlab:install
```

Open a notebook → toolbar **Lumen** button, or **Open With → Lumen Mind Map**.
