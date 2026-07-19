def gen_png_graph(app_obj, filename: str = "graph.png") -> None:
    with open(filename, "wb") as file:
        file.write(app_obj.get_graph().draw_mermaid_png())

